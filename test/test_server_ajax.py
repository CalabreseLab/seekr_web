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
import json

class TestAjaxHTTPRequests(TestHTTPBase):

    # def test_post_fasta(self):
    #     file = open(SMALL_EX_FA_FILE,'rb')
    #
    #     kmer_length = 2
    #     request_fields = dict()
    #     request_fields['file'] = (SMALL_EX_FA_FILE, file, 'text/plain')
    #     request_data = MultipartEncoder(request_fields)
    #     urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)
    #
    #     url = urllib.parse.urljoin(URLBASE, 'files/fasta')
    #     response = self.session.post(url, data=request_data, headers={'Content-Type': request_data.content_type})
    #     self.assertEqual(response.status_code, 200)
    #     json_dict = response.json()
    #     self.assertGreater(len(json_dict['file_id']), 0)
    #     file.close()

    def test_post_fasta_and_run_jobs(self):
        file = open(SMALL_EX_FA_FILE,'rb')

        kmer_length = 2
        fasta_fields = dict()
        fasta_fields['file'] = (SMALL_EX_FA_FILE, file, 'text/plain')
        fasta_data = MultipartEncoder(fasta_fields)
        urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

        fasta_url = urllib.parse.urljoin(URLBASE, 'files/fasta')
        fasta_response = self.session.post(fasta_url, data=fasta_data, headers={'Content-Type': fasta_data.content_type})
        self.assertEqual(fasta_response.status_code, 200)
        json_dict = fasta_response.json()
        self.assertGreater(len(json_dict['file_id']), 0)
        file.close()

        #post to jobs
        file_id = json_dict['file_id']

        kmer_length = 2
        request_fields = dict()
        request_fields['kmer_length'] = str(kmer_length)
        request_fields['user_set_files'] = file_id
        request_fields['normal_set'] = 'user_set'
        request_data = MultipartEncoder(request_fields)

        url = urllib.parse.urljoin(URLBASE, 'jobs')
        response = self.session.post(url, data=request_data, headers={'Content-Type': request_data.content_type})
        self.assertEqual(response.status_code, 200)



if __name__ == '__main__':
    unittest.main()
