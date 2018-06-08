
import sys
import os
from skimage import io, color, img_as_uint

dir_images = './images/'
dir_proc = dir_images + 'processed/'

# Main function
def main(fname, folder='upload'):
    
    # Set image folder
    file_dir = dir_images + folder + '/'

    # Prevent error
    try:
        # Read input
        filename_in = os.path.join(file_dir, fname)
        img = io.imread(filename_in)
        # Process
        img_proc = color.rgb2gray(img_as_uint(img))
        # Define output & save
        filename_out = os.path.join(dir_proc, fname)    
        io.imsave(filename_out, img_proc)
        # Print output path
        print(filename_out)
    
    except:
        # Retunr error
        print("Unexpected error:", sys.exc_info()[0])
    
#start process
if __name__ == '__main__':
    
    # Verify number of args
    if len(sys.argv) > 1:
        # Image filename and folder
        main(sys.argv[1], sys.argv[2])
    elif len(sys.argv) == 1:
        # Only image filename
        main(sys.argv[1]) 