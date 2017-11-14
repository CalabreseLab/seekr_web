from visuals import heatmap
import numpy as np


# col_index : the column index for which we want to sort
# matrix is the input numpy array
# pearson_names is the previous row names before click event, such as [AA, CG, TC, AG] for
#              AA   0.1    0.1
#              CG   0.3    0.8
#              TC   0.2    0.5
#              AG  -0.1   -0.4
# 

def reorder_column( matrix, pearson_names, col_index):
    # sort the target column
    size = len(matrix[0])
    tmp = []
    name_dict = {}
    index_dict = {}
    for i in range(size):
        tmp.append(matrix[i][col_index])
        name_dict[matrix[i][col_index]] = pearson_names[i]
        index_dict[matrix[i][col_index]] = i

    tmp.sort(reverse=True)

    # create temporary matrix to store the new sorted matrix
    sorted_matrix = [[0 for i in range(size)] for j in range(size)]

    # fill the new sorted column
    for i in range(size):
        sorted_matrix[i][col_index] = tmp[i]

    # fill new matrix row by row
    for i in range(size):
        oldRowIndex = index_dict[tmp[i]]
        j = 0
        while j < size:
            if j == col_index:
                j += 1
                continue
            sorted_matrix[i][j] = matrix[oldRowIndex][j]
            j+=1

    col_names= []
    for i in range(size):
        col_names.append(name_dict[tmp[i]])

    # convert new matrix to numpy format
    nparray = np.asarray(sorted_matrix, dtype=np.float32)

    # generate the new heatmap
    heatmap("heatmap2.html", pearson_names, col_names, nparray)



# matrix = np.load('x.npy')
# reorder_column(matrix, ['russel','paul','james', "bob"], 3)