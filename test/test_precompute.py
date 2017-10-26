'''
Test the normalization of kmer counts
@author: Chris Horning

'''

import unittest

import skr_config
from getGenCode import get_unzipped_file_name
from seekrLauncher import compute_normalization_and_frequency


class test_precompute(unittest.TestCase):
    def test_precompute(self):
        for k in range(1,8):
            with open('M5_XKA.fa', mode='r') as infasta:
                (mean, std, unnormalized_frequency) = compute_normalization_and_frequency(infasta,k, False)
                print('For k=', k, 'length is', len(mean))
                assert len(mean) == 4**k

    def test_precompute_gencode(self):
        k=1
        file_name = get_unzipped_file_name(skr_config.GENCODE_HUMAN)
        with open('../cache/' + file_name, mode='r') as infasta:
            (mean, std, unnormalized_frequency) = compute_normalization_and_frequency(infasta, k, False)
            print('For k=', k, 'length is', len(mean))
            assert len(mean) == 4**k

if __name__ == '__main__':
    unittest.main()
