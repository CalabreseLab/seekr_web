# -*- coding: utf-8 -*-
"""
Created on Mon Sep 18 23:48:48 2017

@author: Chris
"""

import os
from io import BytesIO
from io import TextIOWrapper

import numpy as np

import getGenCode
import kmer_counts
import skr_config
from SeekrServerError import SeekrServerError
from precompute_sequence_sets import CACHE_FILE_TYPES
from precompute_sequence_sets import get_file_path_for
from precompute_sequence_sets import get_precomputed_fasta_sets
from seekr_launch_utils import compute_normalization_and_frequency


#NOTE - a number of the  assert False could be replaced if we didn't happen to have it cached.
def run_seekr_algorithm(parameters):
    outfile = 'test1.csv'
    mean_std_loaded = False
    normalization_path = get_precomputed_normalization_path(parameters)
    if normalization_path is not None:
        mean = np.load(normalization_path[0])
        std = np.load(normalization_path[1])
        mean_std_loaded = True

    normal_set = parameters['normal_set']
    if normal_set is None:
        raise SeekrServerError('No normalization set Provided')
    comparison_set = None
    if 'comparison_set' in parameters:
        comparison_set = parameters['comparison_set']
    if 'comparison_set_files' in parameters:
        if normal_set == skr_config.SETTING_USER_SET:
            (mean, std, counts) = compute_normalization_and_frequency(
                infasta=TextIOWrapper(parameters['user_set_files']), kmer_length=parameters['kmer_length'], outfile=outfile)
            counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['comparison_set_files']), outfile=None,
                                               k=parameters['kmer_length'],
                                               label=True, silent=True, binary=False, mean=mean, std=std)
            comparison_counts = counter.make_count_file()
        elif normal_set == skr_config.SETTING_COMPARISION_SET:
            (mean, std, comparison_counts) = compute_normalization_and_frequency(
                infasta=TextIOWrapper(parameters['comparison_set_files']), kmer_length=parameters['kmer_length'])
            counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['user_set_files']), outfile=outfile,
                                               k=parameters['kmer_length'],
                                               label=True, silent=True, binary=False, mean=mean, std=std)
            counts = counter.make_count_file()

        elif mean_std_loaded:
            counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['user_set_files']), outfile=outfile,
                                               k=parameters['kmer_length'],
                                               label=True, silent=True, binary=False, mean=mean, std=std)
            counts = counter.make_count_file()

            comparision_counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['comparison_set_files']), outfile=None,
                                               k=parameters['kmer_length'],
                                               label=True, silent=True, binary=False, mean=mean, std=std)
            comparison_counts = comparision_counter.make_count_file()

        else:
            raise SeekrServerError('Normalization for Comparision Set File is not valid')


        #similarity = np.corrcoef(counts, comparison_counts)
        similarity = corr2_coeff(counts, comparison_counts)
    elif comparison_set is not None and len(comparison_set) > 0 and comparison_set != 'user_set':
        unnormalized_frequency_path = get_precomputed_frequency_path(comparison_set, parameters['kmer_length'])
        assert unnormalized_frequency_path is not None

        if normal_set == skr_config.SETTING_USER_SET:
            (mean, std, counts) = compute_normalization_and_frequency(
                infasta=TextIOWrapper(parameters['user_set_files']), kmer_length=parameters['kmer_length'], outfile=outfile)
            counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['comparison_set_files']), outfile=None,
                                               k=parameters['kmer_length'],
                                               label=True, silent=True, binary=False, mean=mean, std=std)
            comparison_counts = _unnormalized_frequency_to_normalized(unnormalized_frequency_path, mean, std)
        elif normal_set == skr_config.SETTING_COMPARISION_SET:
            raise SeekrServerError('')

        elif mean_std_loaded:
            counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['user_set_files']), outfile=outfile,
                                               k=parameters['kmer_length'],
                                               label=True, silent=True, binary=False, mean=mean, std=std)
            counts = counter.make_count_file()

            comparison_counts = _unnormalized_frequency_to_normalized(unnormalized_frequency_path, mean, std)

        else:
            raise SeekrServerError('No normalization set Provided')

        #similarity = np.corrcoef(counts, comparison_counts)
        similarity = corr2_coeff(counts, comparison_counts)

    else:
        if mean_std_loaded:
            counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['user_set_files']), outfile=outfile,
                                               k=parameters['kmer_length'],
                                               label=True, silent=True, binary=False, mean=mean, std=std)
            counts = counter.make_count_file()
        elif normal_set == skr_config.SETTING_USER_SET:
            counter = kmer_counts.BasicCounter(infasta=TextIOWrapper(parameters['user_set_files']), outfile=outfile, k=parameters['kmer_length'],
                                           label=True, silent=True, binary=False)
            counts = counter.make_count_file()
        else:
            raise SeekrServerError('Normalization type is not valid')

        similarity = np.corrcoef(counts)

    with open(outfile) as csvFile:
        counts_text = csvFile.read()

    bytes_io = BytesIO()
    np.save(bytes_io, similarity)
    bytes_io.seek(0)
    pearsons_file_in_memory = bytes_io.read()

    return counts_text, pearsons_file_in_memory



def get_precomputed_normalization_path(parameters):
    normal_set = parameters['normal_set']

    if normal_set is None or len(normal_set) <= 0:
        return None

    fasta_sets =  get_precomputed_fasta_sets()
    for fasta_set in fasta_sets:
        if normal_set == fasta_set.server_name:
            fasta_file = getGenCode.get_unzipped_file_name(fasta_set)
            mean_path = get_file_path_for(fasta_file, parameters['kmer_length'], CACHE_FILE_TYPES.get('mean'))
            std_path = get_file_path_for(fasta_file, parameters['kmer_length'], CACHE_FILE_TYPES.get('std'))
            if os.path.exists(mean_path) and os.path.exists(std_path):
                return (mean_path, std_path)
            else:
                raise SeekrServerError('Fasta file <' + fasta_file + '> not found for kmer_length=' +  str(parameters['kmer_length']) )
                return None

    return None

def get_precomputed_frequency_path(comparison_set, kmer_length):
    if comparison_set is None or len(comparison_set) <= 0:
        return None

    fasta_sets =  get_precomputed_fasta_sets()
    for fasta_set in fasta_sets:
        if comparison_set == fasta_set.server_name:
            fasta_file = getGenCode.get_unzipped_file_name(fasta_set)
            unnormalized_frequency_path = get_file_path_for(fasta_file, kmer_length, CACHE_FILE_TYPES.get('unnormalized_frequency'))
            if os.path.exists(unnormalized_frequency_path):
                return unnormalized_frequency_path

    return None

def _unnormalized_frequency_to_normalized(unnormalized_frequency_path, mean, std):
    normalized_frequency = np.load(unnormalized_frequency_path)
    normalized_frequency -= mean
    normalized_frequency /= std
    return normalized_frequency

#https://stackoverflow.com/questions/30143417/computing-the-correlation-coefficient-between-two-multi-dimensional-arrays
def corr2_coeff(A,B):
    # Rowwise mean of input arrays & subtract from input arrays themeselves
    A_mA = A - A.mean(1)[:,None]
    B_mB = B - B.mean(1)[:,None]

    # Sum of squares across rows
    ssA = (A_mA**2).sum(1);
    ssB = (B_mB**2).sum(1);

    # Finally get corr coeff
    return np.dot(A_mA,B_mB.T)/np.sqrt(np.dot(ssA[:,None],ssB[None]))