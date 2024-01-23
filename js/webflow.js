// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

(async () => {

    // hold data and vizualization instance in one object
    let visuals = {
        viz_1_1: {
            data: []
        },
        viz_1_3: {
            data: []
        },
        viz_2_5: {
            data: []
        },
    }

    ///////////////////////////
    ///////// data ////////////
    ///////////////////////////

    async function loadData(lan, update = false) {

        await Promise.all(
            Object.keys(visuals).map(viz => {
                return d3.csv(`https://share.chartmetric.com/year-end-report/2023/${viz}_${lan}.csv`, d3.autoType).then(data => {
                    return { name: viz, data: data };
                });
            })
        ).then(function (results) {
            results.forEach(result => {
                visuals[result.name].data = result.data;
            });
            console.log(visuals)
        });

        if (update == true) {
            Object.keys(visuals).forEach(viz => {
                if (visuals[viz].hasOwnProperty('viz')){
                    visuals[viz].viz.update(visuals[viz].data)
                }
            })
        }

    }

    ///////////////////////////
    /////// language //////////
    ///////////////////////////

    // grab the selected language from dropdown on initial load
    let language = document.querySelector('#language').value

    await loadData('en');

    document.querySelector('#language').addEventListener('change', async (e) => {
        if (e.target.value != language) {
            language = e.target.value
            await loadData(language, true)
        }
    });

    ////////////////////////////////
    /////// load visuals ///////////
    ////////////////////////////////

    visuals.viz_2_5.viz = barArc(visuals.viz_2_5.data, {selector: '#viz_2_5'})

})()