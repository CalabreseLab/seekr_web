"""
Web Server for SEEKR Web Portal using Flask

@author: Chris Horning, Shuo Wang, Qidi Chen

"""
import email.utils
import os
import time
import zipfile
from io import BytesIO
from logging.handlers import RotatingFileHandler

from flask import Flask
from flask import redirect
from flask import render_template
from flask import request
from flask import session

import skr_config
from SeekrServerError import SeekrServerError
from precompute_sequence_sets import initialize_cache
from seekrLauncher import run_seekr_algorithm

# create app instance
application = Flask(__name__)
application.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
application.config['SECRET_KEY'] = os.urandom(12)
if not application.debug:
    file_handler = RotatingFileHandler('seekr_server.log')
    file_handler.setLevel(skr_config.LOGGER_LEVEL)
    application.logger.addHandler(file_handler)
application.logger.setLevel(skr_config.LOGGER_LEVEL)

# route handling
@application.route('/')
def admin():
    return redirect('/login')

# login page
@application.route('/login',methods=['POST','GET'])
def login():
    if skr_config.LOGIN_ENABLED is False:
        session['logged_in'] = True

    if request.method == 'GET':
        if session.get('logged_in')==True:
            return redirect('/home')
        return render_template('login.html')
    if request.method == 'POST':
        if request.form['password'] == '123' and request.form['username'] == '123' \
                or request.form['password'] == 'qidi' and request.form['username'] == 'skr' \
                or request.form['password'] == 'david' and request.form['username'] == 'skr' \
                or request.form['password'] == 'chris' and request.form['username'] == 'skr':
            session['logged_in'] = True
            return redirect('/home')
        else:
            return redirect('/login')

# home page
@application.route('/home',methods=['POST','GET'])
def home():
    if request.method == 'GET':
        if session.get('logged_in') == True:
            return render_template('home.html')
        else:
            return redirect('/login')
    if request.method == 'POST':
        print('checkbox selected')
        print (request.form.getlist('check'))
        print('dropdown selected')
        print (request.form.getlist('drop'))

        return render_template('home.html')

# forgot password page
@application.route('/pass')
def password():
    return render_template('pass.html')

@application.route('/faq')
def returnFAQ():
    return render_template('faq.html')

def return_file(file_contents, pearsons):
    t1 = time.perf_counter()
    #Create an in-memory zip file with GZIP to return
    bytes_io = BytesIO()
    zip = zipfile.ZipFile(bytes_io, mode='w', compression=zipfile.ZIP_DEFLATED)
    zip.writestr('counts.csv', str.encode(file_contents, 'utf-8'))
    zip.writestr('pearsons.npy', pearsons)
    zip.close()
    bytes_io.seek(0)
    zipped_bytes = bytes_io.read()
    last_modified = email.utils.formatdate(time.time(), usegmt=True)
    headers = {'Content-Type': 'application/zip',
               'Content-Disposition': 'attachment;filename = seekr.zip',
               'Content-Length' : str(len(zipped_bytes)),
               'Last-Modified' : last_modified
               }
    t2 = time.perf_counter()
    application.logger.debug('Zipping file of length ' + str(len(zipped_bytes))  + ' took %.3f seconds' % (t2 - t1))
    return (zipped_bytes, headers)


# routing function for processing upload actions
@application.route('/jobs', methods=['POST'])
def processUpload():
    try:
        if 'user_set_files' not in request.files:
            application.logger.debug('Error, no file')
            # TODO error case

        user_set_files = request.files['user_set_files']

        # TODO provide reasonable defaults
        parameters = dict()
        parameters['kmer_length'] = int(request.form['kmer_length'])
        parameters['user_set_files'] = user_set_files
        if 'comparison_set_files' in request.files:
            parameters['comparison_set_files'] = request.files['comparison_set_files']

        parameters['kmer_length'] = int(request.form['kmer_length'])
        parameters['normal_set'] = request.form['normal_set']

        if 'gencode_human_set' in request.form:
            parameters['comparison_set'] = 'gencode_human_set'
        if 'gencode_mouse_set' in request.form:
            parameters['comparison_set'] = 'gencode_mouse_set'
        if 'user_set' in request.form:
            parameters['comparison_set'] = 'user_set'
        if 'normal_set' in request.form:
            parameters['normal_set'] = request.form['normal_set']

        t1 = time.perf_counter()
        countsText, pearsons = run_seekr_algorithm(parameters=parameters)
        t2 = time.perf_counter()
        application.logger.debug('Running the algorithm took %.3f seconds' % (t2 - t1))
        return return_file(countsText, pearsons)

    except SeekrServerError as ex:
        application.logger.exception('Error in /jobs')
        return render_template('error.html', text=str(ex))

    except Exception as e:
        application.logger.exception('Error in /jobs')
        return render_template('error.html', text=str(e))

# home page
@application.route('/init_gencode',methods=['GET'])
def init_gencode():
    t1 = time.perf_counter()
    initialize_cache()
    t2 = time.perf_counter()
    application.logger.debug('Initializing the cache took %.3f seconds' % (t2-t1))
    return redirect('/home')

if __name__ == '__main__':
    application.run()

