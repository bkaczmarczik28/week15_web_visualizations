
// function to create the Demographic panel
function createPanel(data)
{
    // input data is the "metadata" dictionary of a given id

    console.log(`Entered createPanel function.`)
    console.log(data)
    // function to create the panel with the test subject data
    // create handle to add a paragraph to the panel
    var panel = d3.select(".panel-body");

    // clear previous entry to table
    panel.html('') 

    Object.entries(data).forEach(function([key,value]) {
        // append a new paragraph for each key-value pair
        var line = panel.append("p");
        line.text(`${key} : ${value}`);
    });

};

// Function to create the bar graph
function updateBarGraph(data){

    // input data is the "sample" dictionary of a given id

    console.log(`Entered updateBarGraph function.`)
    // data already sorted by top 10 bacteria
    // slice so only the top 10 bacteria
    slicedSamples_values= data.sample_values.slice(0,10);
    slicedOTU_ids=data.otu_ids.slice(0,10);
    slicedOTU_labels=data.otu_labels.slice(0,10);

    // create an array that adds OTU to the to OTU ids:
    var slicedOTU_idText=[];
    for (var i=0; i <= slicedOTU_ids.length; i++) {
        slicedOTU_idText[i]=("OTU "+ slicedOTU_ids[i])
    };

    // reverse the data and label arrays to meet the requirements for horizontal Plotly
    reversedData = slicedSamples_values.reverse();
    reversedIdText = slicedOTU_idText.reverse();
    reversedLabels = slicedOTU_labels.reverse();

    // create the trace data from the sliced values
    var trace1 = {
        x : reversedData,
        y : reversedIdText,
        text : reversedLabels,
        type: 'bar',
        orientation: 'h'
    };

    var data = [trace1];

    // create layout for horizontal graph
    var layout ={
        title: "Operational Taxonomic Unit (OTU) Count",
        margin:{
            l: 100, 
            r: 100,
            t: 100,
            b: 100
        }
    }

    // plot on div element associated with "bar"
    Plotly.newPlot('bar', data, layout);

};

// function to create the bubble chart
function updateBubbleChart(data) {

    // input data is the "sample" dictionary of a given id

    console.log('Entered updateBubbleChart function.')

    // create variables from input sample data
    var subjectID = data.id;
    var otu_ids = data.otu_ids;
    var sample_values = data.sample_values;
    var otu_labels = data.otu_labels;

    // create a trace for each bacteria type so the colors will be
    var allTraces=[];

    // Plotting all the data at once with one trace
    var allTraces = 
        {
            x : otu_ids,
            y : sample_values,
            text : otu_labels,
            mode: 'markers',
            marker: 
            {
                size : sample_values,
                color: otu_ids,
                colorscale: 'Portland'
            }
        }
    var chartData=[allTraces];

    var layout = 
    {
        title: "Bubble Chart of Test Subject " + subjectID,
        width: 1000,
        xaxis: {title:`OTU ID`},
        yaxis: {title:`OTU Sample Value Count`}
    }

    Plotly.newPlot('bubble', chartData, layout);
};

function createGauge (data){
    console.log(`Entered createGauge function`)

    var wfreq = data.wfreq;
    console.log(wfreq);

    var gaugeData = [
        {
          type: "indicator",
          mode: "gauge+number",
          value: wfreq,
          title: { text: "<b>Belly Button Washing Frequency </b><br> (Scrubs Per Week)", font:{size:24}}, 
          gauge: {
            axis: { range: [null, 10], tickwidth: 1, tickcolor: "black" },
            bar: { color: "darkblue" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
              { range: [0, 250], color: "LightBlue" },
              { range: [250, 400], color: "royalblue" }
            ],
            threshold: {
              line: { color: "red", width: 4 },
              thickness: 0.75,
              value: wfreq
            }
          }
        }
      ];
      
      var layout = {
        width: 400,
        height: 400,
        margin: { t: 25, r: 25, l: 25, b: 25 },
        font: { color: "darkblue", family: "Arial" },
      };
    Plotly.newPlot('gauge', gaugeData, layout);
};


// function to initialize the page and populate the selector elemen on index.html
function Init() 
{
    // function to initialize the data on the webpage
        // initilize the horizontal graph with the first test subject sample entry:
        console.log(`Enter Initilizing function:`)

        // Grab element reference for the drop-down to populate with all test sample ID's
        var select = d3.select("#selDataset");

        //access data to add test sample ID's
        d3.json("data/samples.json").then(function(data) 
        {
            console.log(`Loaded name data successfully.`)
            var sampleName=data.names;
            // append the sample text ids as an option to the selector element 
            sampleName.forEach((sample) => {
            select.append('option').text(sample).property("value", sample);

            });

        // initialize the Demographic table and graphs with the first entry in JSON file
        // grab the key-pair values from the first entry adn the arrays of bacteria sample data
        var firstEntry = data.metadata[0];
        createPanel(firstEntry);
        createGauge(firstEntry);

        var firstSample=data.samples[0];
        updateBarGraph(firstSample);
        updateBubbleChart(firstSample);
        });
}

function optionChanged(newSample) 
{
    // input newSample is the id number selected in the selector element by the user
    // ex. return value is "941"
    console.log(`newSample ID = ${newSample}`);

    d3.json("data/samples.json").then(function(data) 
    {
        // extract metaData matching newSample id input and send to createPanel and createGauge functions
        var metaData = data.metadata;
        var filteredmetaData = metaData.filter(person => person.id == newSample);
    
        console.log(`Metadata of new Sample:`)
        console.log(filteredmetaData) //how is this data pulled out?
        filteredmetaData = filteredmetaData[0];
        createPanel(filteredmetaData);
        createGauge(filteredmetaData);

        // extract sample data to pass to bar graph and bubble chart
        var sampleData = data.samples;
        var filteredSampleData = sampleData.filter(person => person.id == newSample);

        console.log(`Samples data of new Sample:`);
        console.log(filteredSampleData);
        filteredSampleData = filteredSampleData[0]; //why is this needed?
        updateBarGraph(filteredSampleData);
        updateBubbleChart(filteredSampleData);
    
    });

}

// Initialize page
Init();