"""Example script."""
import os
import argparse
import json

import numpy as np
import matplotlib.pyplot as plt

from flask import Flask, request
from utils import models_qual
from utils.experiment import Experiment
from compatibility.kerascom import image_dim_ordering
from utils.visualization import get_gaussian_lesion_map
from keras.preprocessing.image import load_img, img_to_array
from keras import backend as K

app = Flask(__name__)

dir_images = '../images/'
dir_qual = dir_images + 'quality/'

class QualityData():
    
    def __init__(self, fname, folder, q_pred):
        self.fname = fname
        self.folder = folder
        self.q_pred = '{:.2f}'.format(q_pred)
        
        self.path = os.path.join(folder, fname)
        
        if (q_pred > 50):
            self.qual = "Low Quality"
        else:
            self.qual = "High Quality"
        

def lesion_to_map(lesions, i):
    """Convert the 4D lesion to a 2D map."""
    if image_dim_ordering() == 'th':
        return lesions[i, 0]
    return lesions[i, ..., 0]


@app.route("/qual")
def img_quality():
    """Call this function.

    It will load the image in path_to_img and save the image in the same path,
    with the name prepended with 'out_'.
    """
    
    fname = request.args.get('fname')
    folder = request.args.get('folder')
            
    #fname='1.2.392.200046.100.3.8.101171.7596.20170126094122.1.1.2.1.png'
    #folder = 'gallery'
    
    print('Received Quality Request')
    global wsqual
    # Set image folder
    file_dir = dir_images + folder + '/'
    # Set path to image
    path_to_img =  os.path.join(file_dir, fname)
    # Load and process image
    img = load_img(path_to_img, target_size=(512, 512))
    img_p = img_to_array(img)
    img_p = wsqual.preprocessing_fn(img_p)[np.newaxis]

    y_pred = wsqual.model.predict(img_p)
    # Quality evaluation
    print '{:.2f}'.format(y_pred[0, 0] * 100)
        
    # Print output
    lesions = wsqual.fog_detector.predict(img_p)

    li = get_gaussian_lesion_map(lesion_to_map(lesions, 0),
                                 architecture=wsqual.architecture, layer=wsqual.layer)

    f, ax = plt.subplots()
    ax.set_axis_off()
    ax.axes.get_xaxis().set_visible(False)
    ax.axes.get_yaxis().set_visible(False)
    ax.imshow(img)
    plt.contour(li, levels=np.linspace(0.1, 1, num=4))

    out_path = os.path.join(dir_qual, fname)
    
    f.savefig(out_path, bbox_inches='tight', pad_inches=0)
    plt.close('all')
    
    qual_data = QualityData(fname = fname,
                            folder = dir_qual,
                            q_pred = y_pred[0, 0] * 100)
    
    return json.dumps(qual_data.__dict__) 
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='WSDCNN')    
    """
    Data parameters' definition
    """
    K.set_image_dim_ordering('th')

    parser.add_argument('--experiment_dir', help='The directory where the experiment is saved.', dest='experiment_dir', default='mess_full')
    parser.add_argument('--experiment_name', help='The name of the experiment.', dest='experiment_name', default='wsdcnn')
    parser.add_argument('--qual_experiment_dir', help='The directory where the quality experiment is saved.', dest='qual_experiment_dir', default='parameters')
    parser.add_argument('--qual_experiment_name', help='The name of the experiment.', dest='qual_experiment_name', default='wsdcnn')

    args = parser.parse_args()

    ###########################################################################
    #                                Quality                                  #
    ###########################################################################
    qual_experiment = Experiment(args.qual_experiment_dir, args.qual_experiment_name)

    qual_model_path = os.path.join(qual_experiment._full_dir(), 'model.hdf5')
    qual_hype = qual_experiment.hyperparams

    global wsqual
    wsqual = models_qual.MyModel(qual_hype['layer'], pooling=qual_hype['pooling'], architecture=qual_hype['architecture'],
                                 n_features=qual_hype['n_features'], pretrain=qual_hype['pretrain'])
    wsqual.model.load_weights(qual_model_path)
    wsqual.architecture = qual_hype['architecture']
    wsqual.layer = qual_hype['layer']
    
    # Run python server with Flask
    app.run(port=5000)
