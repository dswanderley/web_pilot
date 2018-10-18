# web_pilot
An image processing web server using Node.js and Python

## Getting Started

### Prerequisites

This project was developed using:

* Node.js v8.11.3
* npm 6.1.0
* Python 2.7
* Jade
* Bootstrap v4.1.1
* jQuery v3.3.1

The following packages are required by the Node.js application:
- express
- express-fileupload 
- stylus 
- morgan 
- nib 
- request 
- fs
- image-size

The Python application requires `Keras v1.1.2` with backend `Theano v0.9`, and `Flask 1.0.2`.

### Installing

#### Node.js

Node.js installation in Ubuntu:
```
>> curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
>> sudo apt-get install -y nodejs
>> sudo apt-get install -y build-essential
```

Install or update npm
```
>> sudo npm install --version
```

Install node packages
```
>> cd 'project directory'
>> npm install express express-fileupload stylus morgan nib request fs image-size
>> npm install jade
```

>> sudo npm install --version

#### Python

Create an Python 2.7 Environment for the image quality and DR evaluations.
 
```
>> conda create -n env_name python=2.7
```

Activate environment
```
>> source activate env_name
```

Install requested packages
```
>> conda install theano=0.9.0
>> pip install keras==1.2.2
>> conda install flask
>> conda install PIL scikit-learn scikit-image h5py
```

## Running

Open two screens on terminal, then run the Python server in Flask and the Node.js server

### Python and Flask server

Open the first screen, then:
```
>> cd 'project directory'
>> cd python
>> cd source actvate env_name
>> python imageeval.py
```

### Python and Flask server

Open the second screen, then:
```
>> cd 'project directory'
>> node app.js
```

