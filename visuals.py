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
from bokeh.plotting import figure, output_file, show, curdoc

from bokeh.io import show, output_file, save
from bokeh.plotting import figure
from bokeh import events
from bokeh.models import CustomJS, Div, Button
from bokeh.layouts import column, row
from bokeh.plotting import figure
from bokeh.embed import components
from bokeh.resources import INLINE


def display_event(div, attributes=[], style='float:left;clear:left;font_size=0.5pt'):
    "Build a suitable CustomJS to display the current event in the div model."
    return CustomJS(args=dict(div=div), code="""
        var attrs = %s; var args = [];
        for (var i=0; i<attrs.length; i++ ) {
            args.push(attrs[i] + '=' + Number(cb_obj[attrs[i]]).toFixed(2));
        }
        var line = "<span style=%r><b>" + cb_obj.event_name + "</b>(" + args.join(", ") + ")</span>\\n";
        var text = div.text.concat(line);
        var lines = text.split("\\n")
        if ( lines.length > 35 ) { lines.shift(); }
        div.text = lines.join("\\n");
    """ % (attributes, style))


def on_Button_Click():
    print("clicked")



def heatmap(np_matrix):

    # np_matrix = np.load('pearsons.npy')

    columns = [str(i) for i in range(np_matrix.shape[1])]

    df = pd.DataFrame(np_matrix, columns = columns)
    # print (df)

    df['seq1'] = range(0, len(df))
    df['seq1'] = df['seq1'].astype(str)
    df = df.set_index('seq1')
    df.columns.name = 'seq2'

    # print(df)
    # print()

    df = pd.DataFrame(df.stack(), columns=['p_val']).reset_index()

    rowIndex = [str(i) for i in range(np_matrix.shape[0])]

    columnIndex = [str(i) for i in range(np_matrix.shape[1])]

    colors = ['#084594', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#deebf7', '#f7fbff']
    colors = colors[::-1]

    mapper = LinearColorMapper(palette=colors, low=df.p_val.min(), high=df.p_val.max())

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
                         formatter=PrintfTickFormatter(format="%d"),
                         label_standoff=6, border_line_color=None, location=(0, 0))

    p.add_layout(color_bar, 'right')

    p.select_one(HoverTool).tooltips = [
        ('index', '@seq1 @seq2'),
        ('pearson correlation', '@p_val'),
    ]

    js_resources = INLINE.render_js()
    css_resources = INLINE.render_css()


    #######################  new code

    div = Div(width=1000)

    button = Button(label="Button")
    button.on_click(on_Button_Click)

    layout = column(button, row(p, div))

    p.js_on_event(events.LODStart, display_event(div))  # Start of LOD display
    p.js_on_event(events.LODEnd, display_event(div))

    point_attributes = ['x', 'y', 'sx', 'sy']  # Point events
    wheel_attributes = point_attributes + ['delta']  # Mouse wheel event
    point_events = [events.Tap, events.DoubleTap, events.Press,
                    events.MouseMove, events.MouseEnter, events.MouseLeave,
                    events.PanStart, events.PanEnd, events.PinchStart, events.PinchEnd]

    for event in point_events:
        p.js_on_event(event, display_event(div, attributes=point_attributes))

    p.js_on_event(events.MouseWheel, display_event(div, attributes=wheel_attributes))

    # # curdoc().add_root(layout)
    #
    # #######################  new code
    #
    # script, div = components(layout)
    #
    # return js_resources, css_resources, script, div

    output_file("templates/heatmap.html")

    save(p)

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

