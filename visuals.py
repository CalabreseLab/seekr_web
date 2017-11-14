import pandas as pd
from math import pi

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

def heatmap(matrix, x_names, y_names):
    columns = x_names
    index = y_names

    df = pd.DataFrame(matrix, columns=columns, index=index)

    df['seq1'] = y_names
    df['seq1'] = df['seq1'].astype(str)
    df = df.set_index('seq1')
    df.columns.name = 'seq2'

    df = pd.DataFrame(df.stack(), columns=['p_val']).reset_index()

    rowIndex = [str(i) for i in range(matrix.shape[0])]

    colors = ['#084594', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#deebf7', '#f7fbff']
    colors = colors[::-1]

    mapper = LinearColorMapper(palette=colors, low=df.p_val.min(), high=df.p_val.max())

    source = ColumnDataSource(df)

    TOOLS = "tap,hover,save,pan,box_zoom,reset,wheel_zoom"

    p = figure(title="Pearson".format(rowIndex[0], rowIndex[-1]),
               x_range=x_names, y_range=list(reversed(y_names)),
               x_axis_location="above", plot_width=900, plot_height=400,
               tools=TOOLS, toolbar_location='below')

    p.grid.grid_line_color = None
    p.axis.axis_line_color = None
    p.axis.major_tick_line_color = None
    p.axis.major_label_text_font_size = "15pt"
    p.axis.major_label_standoff = 0
    p.xaxis.major_label_orientation = pi / 3

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
    return file_html(p, CDN)



###############     end of heatmap() function



def cluster(np_matrix):

    columns = [str(i) for i in range(np_matrix.shape[1])]

    df = pd.DataFrame(np_matrix, columns=columns)
    # print (df)

    df['seq1'] = range(0, len(df))
    df['seq1'] = df['seq1'].astype(str)
    df = df.set_index('seq1')
    df.columns.name = 'seq2'

    df = pd.DataFrame(df.stack(), columns=['p_val']).reset_index()
    print(df)
    print(df.p_val)
    #     df = df.transpose()
    #     print(df)
    #     print(df.pval)

    rowIndex = [str(i) for i in range(np_matrix.shape[0])]

    columnIndex = [str(i) for i in range(np_matrix.shape[1])]

    colors = ['#00ccff', '#0066ff', '#333399', '#000066', '#666633', '#cccc00', '#ffff00']
    colors = colors[::-1]

    mapper = LinearColorMapper(palette=colors, low=df.p_val.min() / 10, high=df.p_val.max() / 10)

    source = ColumnDataSource(df)

    TOOLS = "hover,save,pan,box_zoom,reset,wheel_zoom"

    p = figure(title="Pearson".format(rowIndex[0], rowIndex[-1]),
               x_range=rowIndex, y_range=list(reversed(columnIndex)),
               x_axis_location="above", plot_width=900, plot_height=400,
               tools=TOOLS, toolbar_location='below')

    p.grid.grid_line_color = None
    p.axis.axis_line_color = None
    p.axis.major_tick_line_color = None
    p.axis.major_label_text_font_size = "5pt"
    p.axis.major_label_standoff = 0
    p.xaxis.major_label_orientation = pi / 3

    p.rect(x="seq1", y="seq2", width=1, height=1,
           source=source,
           fill_color={'field': 'p_val', 'transform': mapper},
           line_color=None)

    color_bar = ColorBar(color_mapper=mapper, major_label_text_font_size="5pt",
                         ticker=BasicTicker(desired_num_ticks=len(colors)),
                         formatter=PrintfTickFormatter(format="%d%%"),
                         label_standoff=6, border_line_color=None, location=(0, 0))

    p.add_layout(color_bar, 'right')

    p.select_one(HoverTool).tooltips = [
        ('index', '@seq1 @seq2'),
        ('rate', '@p_val%'),
    ]

    output_file("templates/cluster.html")
    save(p)

