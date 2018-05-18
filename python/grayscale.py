
import sys
import os
from skimage import io, color, img_as_uint

dir_orig = './images/upload/'
dir_proc = './images/processed/'


def main(fname):
    
    try:
        filename_in = os.path.join(dir_orig, fname)
     #   print(filename_in)
    
        img = io.imread(filename_in)
        img_proc = color.rgb2gray(img_as_uint(img))
    
        filename_out = os.path.join(dir_proc, fname)    
        io.imsave(filename_out, img_proc)
        print(filename_out)
    
    except:
        print("Unexpected error:", sys.exc_info()[0])
    
#start process
if __name__ == '__main__':
    main(sys.argv[1])
    