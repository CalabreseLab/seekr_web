"""
Contains the common basis for tests of the Seekr Server

@author: Chris Horning
"""

from test_config import PROTOCOL, IP, PORT, URLBASE, \
    SMALL_EX_FA_FILE
import unittest
import requests
import urllib.parse

class TestHTTPBase(unittest.TestCase):
    cookies = None

    def setUp(self):
        if self.cookies is None:
            self.login()

    """
    Perform a login at be beginning of tests to get the cookie that later requests will need.
    This test should pass regardless of if login is enabled or disabled
    """
    def login(self):
        request_fields = {'username': '123', 'password': '123'}
        urlbase = PROTOCOL + '://' + IP + ':' + str(PORT)
        url = urllib.parse.urljoin(URLBASE, 'login')
        response = requests.post(url, data=request_fields)
        self.assertEqual(response.status_code, 200)
        self.assertTrue('/home' in response.url)
        self.cookies = response.cookies