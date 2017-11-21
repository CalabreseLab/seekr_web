import pandas as pd
import itertools
import numpy as np
from math import pi
from scipy import stats

from bokeh.models import (
    ColumnDataSource,
    HoverTool,
    LinearColorMapper,
    BasicTicker,
    PrintfTickFormatter,
    ColorBar,
)

from bokeh.io import output_file, save, show
from bokeh import events
from bokeh.models import CustomJS, Div, Button
from bokeh.layouts import column, row
from bokeh.plotting import figure
from bokeh.embed import components, file_html
from bokeh.resources import CDN



# x is horizontal-layout label, y is vertical-layout label
# filename is the target html name we will generate
# matrix is the input numpy array

def heatmap(matrix, user_names, comparison_names):

    # control the length of each name label
    new_user_names = []
    new_comparison_names = []
    for s in user_names:
        if len(s) > 20:
            new_user_names.append(s[:20])
        else:
            new_user_names.append(s)

    for s in comparison_names:
        if len(s) > 20:
            new_comparison_names.append(s[:20])
        else:
            new_comparison_names.append(s)

    # assign the new name lists
    user_names = new_user_names
    comparison_names = new_comparison_names

    columns = comparison_names
    index = user_names

    df = pd.DataFrame(matrix, columns=columns, index=index)

    df['seq1'] = user_names
    df = df.set_index('seq1')
    df.columns.name = 'seq2'

    df = pd.DataFrame(df.stack(), columns=['p_val']).reset_index()

    rowIndex = [str(i) for i in range(matrix.shape[0])]

    colors = ['#084594', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#deebf7', '#f7fbff']
    colors = colors[::-1]

    mapper = LinearColorMapper(palette=colors, low=df.p_val.min(), high=df.p_val.max())

    # df = df.transpose()
    source = ColumnDataSource(df)

    TOOLS = "tap,hover,save,pan,box_zoom,reset,wheel_zoom"

    p = figure(title="Pearson".format(rowIndex[0], rowIndex[-1]),
               x_range=user_names, y_range=list(reversed(comparison_names)),
               x_axis_location="above", plot_width=900, plot_height=400,
               tools=TOOLS, toolbar_location='below')

    p.grid.grid_line_color = None
    p.axis.axis_line_color = None
    p.axis.major_tick_line_color = None
    p.axis.major_label_text_font_size = "5pt"
    p.axis.major_label_standoff = 0
    p.xaxis.major_label_orientation = pi / 3
    
    p.xaxis.visible = False
    p.yaxis.visible = False

    p.rect(x="seq1", y="seq2", width=1, height=1,
           source=source,
           fill_color={'field': 'p_val', 'transform': mapper},
           line_color=None)

    color_bar = ColorBar(color_mapper=mapper, major_label_text_font_size="5pt",
                         ticker=BasicTicker(desired_num_ticks=len(colors)),
                         formatter=PrintfTickFormatter(format="%d"),
                         label_standoff=6, border_line_color=None, location=(0, 0))

    p.add_layout(color_bar, 'right')

    p.select_one(HoverTool).tooltips = [
        ('index', '@seq1 @seq2'),
        ('pearson correlation', '@p_val'),
    ]

    div = Div(width=1000)

    button = Button(label="Button")

    layout = column(button, row(p, div))

    #######################  new code

    callback = CustomJS(args=dict(source=source), code=
    """
         var column_index = cb_obj.x ;
         console.log("Tap event occured at x-position: " + cb_obj.x + " " + cb_obj.y);

    """)

    p.js_on_event(events.Tap, callback)

    # #######################  new code

    # script, div = components(layout)
    #
    # return js_resources, css_resources, script, div

    #show(p)
    return components(p, CDN)



def kmermap(kmer_counts_matrix, user_names, k):

    new_names = []
    for s in user_names:
        if len(s) > 20:
            new_names.append(s[:20])
        else:
            new_names.append(s)

    user_names = new_names

    x = ['A', 'G', 'T', 'C']
    name1 = [p for p in itertools.product(x, repeat=k)]
    count = 0
    for i in name1:
        name1[count] = ''.join(i)
        count = count + 1

    # result = np.load('pearsons.npy')
    #     print(result)
    norm_npm = kmer_counts_matrix
    flat_npm = norm_npm.flatten()
    scale_npm = norm_npm.flatten()
    mean = np.mean(scale_npm)
    z_npm = stats.zscore(flat_npm)
    print(z_npm)
    count = 0
    for i in z_npm:
        if i >= 2:
            z_npm[count] = 3
            scale_npm[count] = mean
        elif i < -1:
            i = -1
            scale_npm[count] = mean
        count = count + 1
    print(z_npm)

    df = pd.DataFrame(kmer_counts_matrix, index=user_names, columns=name1)
    print('111')
    print(df)

    df['seq1'] = user_names
    print('222')
    print(df)
    df['seq1'] = df['seq1'].astype(str)
    print('333')
    print(df)
    df = df.set_index('seq1')
    print('444')
    print(df)
    df.columns.name = 'seq2'
    print('555')
    print(df)
    # print()

    df = pd.DataFrame(df.stack(), columns=['c_val']).reset_index()
    df['z_score'] = z_npm
    df['scale'] = scale_npm

    print(df)
    print(df.c_val)

    rowIndex = name1
    columnIndex = user_names

    colors = ['#ffff33', '#ffff00', '#cccc00', '#999900', '#000000', '#000066', '#0000cc']
    colors = colors[::-1]

    mapper = LinearColorMapper(palette=colors, low=df.z_score.min(), high=df.z_score.max())
    mapper2 = LinearColorMapper(palette=colors, low=df.scale.min(), high=df.scale.max())
    source = ColumnDataSource(df)

    TOOLS = "hover,save,pan,box_zoom,reset,wheel_zoom"

    p = figure(title="Counts".format(rowIndex[0], rowIndex[-1]),
               x_range=rowIndex, y_range=list(reversed(columnIndex)),
               x_axis_location="above", plot_width=500, plot_height=500,
               tools=TOOLS, toolbar_location='below')

    p.grid.grid_line_color = None
    p.axis.axis_line_color = None
    p.axis.major_tick_line_color = None
    p.axis.major_label_text_font_size = "5pt"
    p.axis.major_label_standoff = 0
    p.xaxis.major_label_orientation = pi / 3

    p.xaxis.visible = False
    p.yaxis.visible = False

    p.rect(x="seq2", y="seq1", width=1, height=1,
           source=source,
           fill_color={'field': 'z_score', 'transform': mapper},
           line_color=None)

    color_bar = ColorBar(color_mapper=mapper2, major_label_text_font_size="5pt",
                         ticker=BasicTicker(desired_num_ticks=len(colors)),
                         formatter=PrintfTickFormatter(format="%d"),
                         label_standoff=6, border_line_color=None, location=(0, 0))

    p.add_layout(color_bar, 'right')

    p.select_one(HoverTool).tooltips = [
        ('sequence x kmer', '@seq1 @seq2'),
        ('count', '@c_val'),
    ]

    #show(p)
    return components(p, CDN)

