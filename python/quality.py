"""Example script."""
import os
import argparse
import json

import numpy as np
import matplotlib.pyplot as plt

from flask import Flask, request
from utils import models_qual
from utils import models_dr
from utils.experiment import Experiment
from compatibility.kerascom import image_dim_ordering
from utils.visualization import get_gaussian_lesion_map
from keras.preprocessing.image import load_img, img_to_array
from keras import backend as K

app = Flask(__name__)

dir_images = '../images/'
dir_qual = dir_images + 'quality/'
dir_detectdr = dir_images + 'dr_detection/'

###############################################################################

class QualityData():
    
    def __init__(self, fname, folder, q_pred):
        self.fname = fname
        self.folder = folder
        self.q_pred = '{:.2f}'.format(q_pred)
        
        self.path = os.path.join(folder, fname)
                
        if (q_pred > 50):
            self.qual = "High Quality"
        else:
            self.qual = "Low Quality"


class DiabeticRetinopathyData():
    
    def __init__(self, fname, folder, dr_pred):
        self.fname = fname
        self.folder = folder
        self.dr_pred = '{:.2f}'.format(dr_pred)
        
        self.path = os.path.join(folder, fname)
                
        if (dr_pred > 50):
            self.dr = "Diabetic Retinopathy"
        else:
            self.dr = "Healthy"

###############################################################################

def lesion_to_map(lesions, i):
    """Convert the 4D lesion to a 2D map."""
    if image_dim_ordering() == 'th':
        return lesions[i, 0]
    return lesions[i, ..., 0]

###############################################################################

@app.route("/qual")
def img_quality():
    """
    Evaluate the image quality
    
    Load the image in path_to_img (folder + fname) and save the image in the 
    dir_qual folder with the same name.
    """
    # Get filename from args
    try:
        fname = request.args.get('fname')
    except:
        print("Unexpected error:", request.exc_info()[0])
        return 
    # Get folder name from args
    try:
        folder = request.args.get('folder')
    except:
        folder = 'upload'
    # Set image folder
    file_dir = dir_images + folder + '/'
    # Set path to image
    path_to_img =  os.path.join(file_dir, fname)
    print('Received Quality Request')
    
    # Load  global variables
    global wsqual
    # Load and process image
    img = load_img(path_to_img, target_size=(512, 512))
    img_p = img_to_array(img)
    img_p = wsqual.preprocessing_fn(img_p)[np.newaxis]

    # Quality evaluation
    y_pred = wsqual.model.predict(img_p)
    lesions = wsqual.fog_detector.predict(img_p)

    # Plot lesions map
    li = get_gaussian_lesion_map(lesion_to_map(lesions, 0),
                                 architecture = wsqual.architecture, 
                                 layer = wsqual.layer)
    f, ax = plt.subplots()
    ax.set_axis_off()
    ax.axes.get_xaxis().set_visible(False)
    ax.axes.get_yaxis().set_visible(False)
    ax.imshow(img)
    plt.contour(li, levels = np.linspace(0.1, 1, num=4))

    # Output file
    out_path = os.path.join(dir_qual, fname)
    # Save figure
    f.savefig(out_path, bbox_inches='tight', pad_inches=0)
    plt.close('all')
    # Output data
    qual_data = QualityData(fname = fname,
                            folder = dir_qual,
                            q_pred = 100 - (y_pred[0, 0] * 100))
    
    return json.dumps(qual_data.__dict__) 
    

@app.route("/dr")
def dr_detection():
    """
    Detect Diabetic Retinopathy
    
    Load the image in path_to_img (folder + fname) and save the image in the 
    dir_qual folder with the same name.
    """
    # Get filename from args
    try:
        fname = request.args.get('fname')
    except:
        print("Unexpected error:", request.exc_info()[0])
        return 
    # Get folder name from args
    try:
        folder = request.args.get('folder')
    except:
        folder = 'upload'
    # Set image folder
    file_dir = dir_images + folder + '/'
    # Set path to image
    path_to_img =  os.path.join(file_dir, fname)
    print('Received DR Request')
    
    # Load  global variables
    global wsdcnn
    # Load and process image
    img = load_img(path_to_img, target_size=(512, 512))
    img_p = img_to_array(img)
    img_p = wsdcnn.preprocessing_fn(img_p)[np.newaxis]

    # Prediction
    y_pred = wsdcnn.model.predict(img_p)
    print(y_pred)
    lesions = wsdcnn.lesion_detectors[0].predict(img_p)

    # Plot lesions map
    li = get_gaussian_lesion_map(lesion_to_map(lesions, 0),
                                 architecture=wsdcnn.architecture, layer=wsdcnn.layer)
    f, ax = plt.subplots()
    ax.set_axis_off()
    ax.axes.get_xaxis().set_visible(False)
    ax.axes.get_yaxis().set_visible(False)
    ax.imshow(img)
    plt.contour(li, levels=np.linspace(0.5, 1, num=4))

    # Output file
    out_path = os.path.join(dir_detectdr, fname)
    # Save figure
    f.savefig(out_path, bbox_inches='tight', pad_inches=0)
    plt.close('all')
    # Output data
    dr_data = DiabeticRetinopathyData(fname = fname,
                                      folder = dir_qual,
                                      q_pred = y_pred[0, 0] * 100)
    
    return json.dumps(dr_data.__dict__) 

###############################################################################

if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='WSDCNN')    
    """
    Data parameters' definition
    """
    K.set_image_dim_ordering('th')

    parser.add_argument('--experiment_dir', help='The directory where the experiment is saved.', dest='experiment_dir', default='parameters')
    parser.add_argument('--experiment_name', help='The name of the experiment.', dest='experiment_name', default='wsdcnn')
    parser.add_argument('--qual_experiment_dir', help='The directory where the quality experiment is saved.', dest='qual_experiment_dir', default='parameters')
    parser.add_argument('--qual_experiment_name', help='The name of the experiment.', dest='qual_experiment_name', default='wsqual')

    args = parser.parse_args()

    ###########################################################################
    #                                Quality                                  #
    ###########################################################################
    qual_experiment = Experiment(args.qual_experiment_dir, args.qual_experiment_name)

    qual_model_path = os.path.join(qual_experiment._full_dir(), 'model.hdf5')
    qual_hype = qual_experiment.hyperparams

    global wsqual
    wsqual = models_qual.MyModel(qual_hype['layer'], 
                                 pooling=qual_hype['pooling'], 
                                 architecture=qual_hype['architecture'],
                                 n_features=qual_hype['n_features'], 
                                 pretrain=qual_hype['pretrain'])
    wsqual.model.load_weights(qual_model_path)
    wsqual.architecture = qual_hype['architecture']
    wsqual.layer = qual_hype['layer']
    
    ###########################################################################
    #                        Diabetic Retinopathy                             #
    ###########################################################################    
    dr_experiment = Experiment(args.experiment_dir, args.experiment_name)

    model_path = os.path.join(dr_experiment._full_dir(), 'model.hdf5')
    dr_hype = dr_experiment.hyperparams
    if 'classes' not in dr_hype:
        dr_hype['classes'] = []

    global wsdcnn
    wsdcnn = models_dr.MyModel(dr_hype['layer'], 
                               application=dr_hype['application'],
                               architecture=dr_hype['architecture'],
                               n_features=dr_hype['n_features'], 
                               weak_sup=dr_hype['weak_sup'], 
                               pretrain=dr_hype['pretrain'],
                               classes=dr_hype['classes'])
    wsdcnn.model.load_weights(model_path)
    wsdcnn.architecture = dr_hype['architecture']
    wsdcnn.layer = dr_hype['layer']
    
    # Run python server with Flask
    app.run(port=5000)
