"""
Unit Test to test the performance of the server
Note - Files will

@author: Chris Horning
"""

import unittest
import requests
import urllib.parse
from test_config import *
from requests_toolbelt.multipart.encoder import MultipartEncoder
from test_common import TestHTTPBase
import time
import humanize

class TestHTTPRequests(TestHTTPBase):
    perf_out = None

    def setUp(self):
        super(TestHTTPRequests, self).setUp()
        if self.perf_out is None:
            self.perf_out = open('perf.txt', mode='a')

    def test_asmall_file(self):
        file_name = SMALL_USER_FILE
        for kmer_length in range(1,8):
            file = open(file_name,'rb')
            second_file = open(SMALL_COMP_FILE, 'rb')

            request_fields = dict()
            request_fields['kmer_length'] = str(kmer_length)
            request_fields['user_set_files'] = (file_name, file, 'text/plain')
            request_fields['comparison_set_files'] = (SMALL_COMP_FILE, second_file, 'text/plain')
            request_fields['normal_set'] = 'user_set'
            request_data = MultipartEncoder(request_fields)
            urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

            url = urllib.parse.urljoin(URLBASE, 'jobs')
            t1 = time.perf_counter()
            response = requests.post(url, data=request_data,  headers={'Content-Type': request_data.content_type}, cookies=self.cookies)
            t2 = time.perf_counter()
            response_length = len(response.content)
            request_content_len = request_data.len
            self.perf_out.write('File\t' + file_name.ljust(40) + '\trequest_len=' +  humanize.naturalsize(request_content_len, binary=True) + \
                                '\twith k=' + str(kmer_length) + '\tstatus code=' + str(response.status_code) + '\t and response size=' + \
                                humanize.naturalsize(response_length, binary=True)  +  '\ttook %.3f seconds\n' % (t2 - t1))
            self.perf_out.flush()
            file.close()
            second_file.close()

    def test_bsmall_file_precomputed_gencode(self):
        file_name = SMALL_COMP_FILE
        for kmer_length in range(1,8):
            file = open(file_name,'rb')

            request_fields = dict()
            request_fields['kmer_length'] = str(kmer_length)
            request_fields['user_set_files'] = (file_name, file, 'text/plain')
            request_fields['gencode_human_set'] = 'gencode_human_set'
            request_fields['normal_set'] = 'gencode_human_set'
            request_data = MultipartEncoder(request_fields)
            urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

            url = urllib.parse.urljoin(URLBASE, 'jobs')
            t1 = time.perf_counter()
            response = requests.post(url, data=request_data,  headers={'Content-Type': request_data.content_type}, cookies=self.cookies)
            t2 = time.perf_counter()
            response_length = len(response.content)
            request_content_len = request_data.len
            self.perf_out.write('File\t' + file_name.ljust(40) + '\trequest_len=' +  humanize.naturalsize(request_content_len, binary=True) + \
                                '\twith k=' + str(kmer_length) + '\tstatus code=' + str(response.status_code) + '\t and response size=' + \
                                humanize.naturalsize(response_length, binary=True)  +  '\ttook %.3f seconds\n' % (t2 - t1))
            self.perf_out.flush()
            file.close()

    def test_cno_precache_small_k(self):
        for file_name in LARGE_FILES:
            for kmer_length in range(1,4):
                file = open(file_name,'rb')
                second_file = open(SMALL_COMP_FILE, 'rb')

                request_fields = dict()
                request_fields['kmer_length'] = str(kmer_length)
                request_fields['user_set_files'] = (file_name, file, 'text/plain')
                request_fields['comparison_set_files'] = (SMALL_COMP_FILE, second_file, 'text/plain')
                request_fields['normal_set'] = 'user_set'
                request_data = MultipartEncoder(request_fields)
                urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

                url = urllib.parse.urljoin(URLBASE, 'jobs')
                t1 = time.perf_counter()
                response = requests.post(url, data=request_data,  headers={'Content-Type': request_data.content_type}, cookies=self.cookies)
                t2 = time.perf_counter()
                response_length = len(response.content)
                request_content_len = request_data.len
                self.perf_out.write('File\t' + file_name.ljust(40) + '\trequest_len=' +  humanize.naturalsize(request_content_len, binary=True) + \
                                    '\twith k=' + str(kmer_length) + '\tstatus code=' + str(response.status_code) + '\t and response size=' + \
                                    humanize.naturalsize(response_length, binary=True)  +  '\ttook %.3f seconds\n' % (t2 - t1))
                self.perf_out.flush()
                file.close()
                second_file.close()

    def test_dno_precache_larger_k(self):
        for file_name in LARGE_FILES:
            for kmer_length in range(4, 8):
                file = open(file_name, 'rb')
                second_file = open(SMALL_COMP_FILE, 'rb')

                request_fields = dict()
                request_fields['kmer_length'] = str(kmer_length)
                request_fields['user_set_files'] = (file_name, file, 'text/plain')
                request_fields['comparison_set_files'] = (SMALL_COMP_FILE, second_file, 'text/plain')
                request_fields['normal_set'] = 'user_set'
                request_data = MultipartEncoder(request_fields)
                urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

                url = urllib.parse.urljoin(URLBASE, 'jobs')
                t1 = time.perf_counter()
                response = requests.post(url, data=request_data, headers={'Content-Type': request_data.content_type},
                                         cookies=self.cookies)
                t2 = time.perf_counter()
                response_length = len(response.content)
                request_content_len = request_data.len
                self.perf_out.write(
                    'File\t' + file_name.ljust(40) + '\trequest_len=' + humanize.naturalsize(request_content_len,
                                                                                             binary=True) + \
                    '\twith k=' + str(kmer_length) + '\tstatus code=' + str(
                        response.status_code) + '\t and response size=' + \
                    humanize.naturalsize(response_length, binary=True) + '\ttook %.3f seconds\n' % (t2 - t1))
                self.perf_out.flush()
                file.close()
                second_file.close()

    def tearDown(self):
        super(TestHTTPRequests, self).tearDown()
        if self.perf_out is not None:
            self.perf_out.close()

# def suite():
#     suite = unittest.TestSuite()
#     suite.addTest(TestHTTPRequests('test_asmall_file'))
#     suite.addTest(TestHTTPRequests('test_bsmall_file_precomputed_gencode'))
#     suite.addTest(TestHTTPRequests('test_cno_precache_small_k'))
#     suite.addTest(TestHTTPRequests('test_dno_precache_larger_k'))
#     return suite
#
# if __name__ == '__main__':
#     runner = unittest.TextTestRunner()
#     runner.run(suite())