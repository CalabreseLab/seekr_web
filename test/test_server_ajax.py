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

    def test_post_fasta(self):
        file = open(SMALL_EX_FA_FILE,'rb')

        kmer_length = 2
        request_fields = dict()
        request_fields['file'] = (SMALL_EX_FA_FILE, file, 'text/plain')
        request_data = MultipartEncoder(request_fields)
        urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)

        url = urllib.parse.urljoin(URLBASE, 'files/fasta')
        response = self.session.post(url, data=request_data, headers={'Content-Type': request_data.content_type})
        self.assertEqual(response.status_code, 200)
        json_dict = response.json()
        self.assertGreater(len(json_dict['file-id']), 0)
        file.close()

if __name__ == '__main__':
    unittest.main()
