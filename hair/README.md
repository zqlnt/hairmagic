# hair-synthesis-app

Starting and Stopping the Backend Server
1. Start Your Runpod Pod
o Whenever you need the backend server, start your Runpod pod.
o Stop the pod when you are done to save resources.
2. Install Required Packages
o Open the command line interface.
o Run the following commands to install the necessary Python packages:
pip install flask
pip install --ignore-installed flask
pip install flask_cors
pip install diffusers==0.11.1
pip install transformers
pip install accelerate
3. Run the Backend Application
o In the command line interface, navigate to the directory where your backend code 
is located.
o Run the following command to start the backend server:
python app.py
Creating a New Pod
Setting Up a New Pod
1. Connect with Jupyter Notebook
o After starting your new pod, connect to it using Jupyter Notebook.
2. Create app.py File
o In Jupyter Notebook, create a new Python file named app.py.
o Copy and paste the backend code into the app.py file.
3. Install Required Packages
o Open the command line interface.
o Run the following commands to install the necessary Python packages:
pip install flask
pip install --ignore-installed flask
pip install flask_cors
pip install diffusers==0.11.1
pip install transformers
pip install accelerate
4. Open TCP 5000 Port
o Ensure that the TCP 5000 port is open on your new pod.
5. Update IP and Port in Frontend
o After every start/stop of the pod, there will be a new IP and port number.
o Copy the new IP and port number.
o Update the IP and port number in frontend/src/components/canvus.js at line 
number 184.
6. Run the Backend Application
o In the command line interface, navigate to the directory where your backend code 
is located.
o Run the following command to start the backend server:
python app.py
