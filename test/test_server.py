"""
Unit Test for Server

@author: Shuo Wang, Qidi Chen, Chris Horning
"""
import unittest
import requests
import urllib.parse
from test_config import *
from requests_toolbelt.multipart.encoder import MultipartEncoder
from test_common import TestHTTPBase


class TestHTTPRequests(TestHTTPBase):

    def test_get(self):
        response = self.session.get(URLBASE)
        self.assertEqual(response.status_code , 200)

    def test_jobs(self):
        file = open(SMALL_EX_FA_FILE,'rb')

        kmer_length = 2
        request_fields = dict()
        request_fields['kmer_length'] = str(kmer_length)
        request_fields['user_set_files'] = (SMALL_EX_FA_FILE, file, 'text/plain')
        request_fields['normal_set'] = 'user_set'
        request_data = MultipartEncoder(request_fields)
        urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

        url = urllib.parse.urljoin(URLBASE, 'jobs')
        response = self.session.post(url, data=request_data,  headers={'Content-Type': request_data.content_type})
        self.assertEqual(response.status_code, 200)
        file.close()

    def test_two_files(self):
        file = open(SMALL_USER_FILE,'rb')
        second_file = open(SMALL_COMP_FILE,'rb')

        kmer_length = 1
        request_fields = dict()
        request_fields['kmer_length'] = str(kmer_length)
        request_fields['user_set_files'] = (SMALL_USER_FILE, file, 'text/plain')
        request_fields['comparison_set_files'] = (SMALL_COMP_FILE, second_file, 'text/plain')
        request_fields['normal_set'] = 'comparison_set'
        request_data = MultipartEncoder(request_fields)
        urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

        url = urllib.parse.urljoin(URLBASE, 'jobs')
        response = self.session.post(url, data=request_data,  headers={'Content-Type': request_data.content_type})
        self.assertEqual(response.status_code, 200)
        file.close()
        second_file.close()

if __name__ == '__main__':
    unittest.main()
