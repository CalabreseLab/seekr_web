"""
Web Server for SEEKR Web Portal using Flask

@author: Chris Horning, Shuo Wang, Qidi Chen

"""
import email.utils
import os
import time
import zipfile
from io import BytesIO
from io import StringIO
from logging.handlers import RotatingFileHandler

from flask import Flask
from flask import redirect
from flask import render_template
from flask import render_template_string
from flask import request
from flask import session
from flask import jsonify

import skr_config
from SeekrServerError import SeekrServerError
from precompute_sequence_sets import initialize_cache
from seekrLauncher import run_seekr_algorithm
from seekrLauncher import _run_seekr_algorithm
from pearson import pearson
import visuals


import session_helper

"""
seekrServer.py contains the Web Services the application provides using the Flask framework.

"""

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
        session_helper.init_user_login(session)
        return redirect('/home')

    if request.method == 'GET':
        if session.get('logged_in')==True:
            return redirect('/home')
        return render_template('login.html')
    if request.method == 'POST':
        if request.form['password'] == '123' and request.form['username'] == '123' \
                or request.form['password'] == 'qidi' and request.form['username'] == 'skr' \
                or request.form['password'] == 'david' and request.form['username'] == 'skr' \
                or request.form['password'] == 'chris' and request.form['username'] == 'skr':
            session_helper.init_user_login(session)
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


# legacy function for processing upload actions
@application.route('/jobs', methods=['POST'])
def legacy_process_upload():
    try:
        if skr_config.LOGIN_ENABLED and session.get('logged_in') != True:
            return redirect('/login')

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

# routing function for processing upload actions
@application.route('/_jobs', methods=['POST'])
def process_jobs():
    try:
        if skr_config.LOGIN_ENABLED and session.get('logged_in') != True:
            return redirect('/login')

        # TODO provide reasonable defaults
        json_parameters = request.get_json()


        parameters = dict()

        if ('user_set_id' in json_parameters):
            parameters['user_set_files'] = json_parameters['user_set_id']

        if ('comparison_set_id' in json_parameters and json_parameters['comparison_set_id'] is not None and json_parameters['comparison_set_id'] != ''):

            parameters['comparison_set_files'] = json_parameters['comparison_set_id']

        if 'comparison_set' in json_parameters:
            parameters['comparison_set'] = str(json_parameters['comparison_set'])

        if 'kmer_length' in json_parameters:
             parameters['kmer_length'] = int(json_parameters['kmer_length'])

        if 'normal_set' in json_parameters:
            parameters['normal_set'] = str(json_parameters['normal_set'])

        parameters['directory_id'] = session_helper.get_directory_id(session)

        if parameters['directory_id'] is None or len(parameters['directory_id']) <= 0:
            raise SeekrServerError('User directory not found for this session')


        t1 = time.perf_counter()
        counts, names, comparison_counts, comparison_names = _run_seekr_algorithm(parameters=parameters)
        t2 = time.perf_counter()
        application.logger.debug('Running the algorithm took %.3f seconds' % (t2 - t1))

        pearsons = pearson(counts, comparison_counts)

        # heatmap_file = visuals.heatmap(pearsons, names, comparison_names)
        # heatmap_id = session_helper.generate_file_identifier()
        #
        # session_helper.create_file(heatmap_file, session, heatmap_id, extension='html')
        #
        # kmermap_file = visuals.kmermap(counts, names, parameters['kmer_length'])
        # kmermap_id = session_helper.generate_file_identifier()
        #
        # session_helper.create_file(kmermap_file, session, kmermap_id, extension='html')

        heat_script, heat_div = visuals.heatmap(pearsons, names, comparison_names)
        kmer_script, kmer_div = visuals.kmermap(counts, names, parameters['kmer_length'])


        return render_template('visual.html', heat_div=heat_div, heat_script=heat_script, kmer_script=kmer_script, kmer_div=kmer_div)

    except Exception as e:
        application.logger.exception('Error in /jobs')
        return render_template('error.html', text=str(e))


@application.route('/files/fasta', methods=['POST'])
def create_fasta():
    """
    Post to upload a new fasta file
    This file will be given a unique identifier

    """
    assert request.method == 'POST'

    if 'file' not in request.files:
        application.logger.debug('Error, no file')
        # TODO error case

    file = request.files['file']

    file_identifier = session_helper.generate_file_identifier()
    session_helper.create_file(file, session, file_identifier, extension='fasta')

    json_dict = {'file_id': file_identifier}

    return jsonify(json_dict)


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

