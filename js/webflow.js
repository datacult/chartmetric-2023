// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/ 

import { Sankey } from './highFi/1_1.js';
import { Treemap } from './highFi/2_2.js'
import { Table } from './highFi/2_3.js';
import { gradientBar } from './highFi/2_9.js';

(async () => {

    // hold data and vizualization instance in one object
    let visuals = {

        viz_1_1: {
            data: [],
            options: {
                selector: 'viz_1_1'
            }
        },
        viz_2_2: {
            data: [],
            options: {
                selector: 'viz_2_2'
            }
        },
        viz_2_3: {
            data: [],
            options: {
                selector: 'viz_2_3'
            }
        },
        viz_2_5: {
            data: [],
            options: {
                selector: '#viz_2_5'
            }
        },
        viz_2_9: {
            data: [],
            options: {
                selector: 'viz_2_9'
            }
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

        // only update the visuals if the update flag is true
        if (update == true) {
            Object.keys(visuals).forEach(viz => {
                if (visuals[viz].hasOwnProperty('viz')) {
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
        // check the language has changed
        if (e.target.value != language) {
            language = e.target.value
            await loadData(language, true)
        }
    });

    ////////////////////////////////
    ///// populate dropdown ////////
    ////////////////////////////////

    let artistDropdown = document.querySelector('#artist')
    let artistNames = [...new Set(visuals.viz_2_9.data.map(d => d.ARTIST_NAME))]
    artistNames.forEach(artist => {
        let option = document.createElement('option')
        option.text = artist
        artistDropdown.add(option)
    })

    ////////////////////////////////
    /////// load visuals ///////////
    ////////////////////////////////

    visuals.viz_1_1.viz = Sankey(visuals.viz_1_1.data, visuals.viz_1_1.options.selector);
    visuals.viz_2_2.viz = Treemap(visuals.viz_2_2.data, visuals.viz_2_2.options.selector, "Artist Genres", "top_genres_for_artists_all_time")
    visuals.viz_2_3.viz = Table(visuals.viz_2_3.data, visuals.viz_2_3.options.selector)
    visuals.viz_2_5.viz = barArc(visuals.viz_2_5.data, visuals.viz_2_5.options)
    visuals.viz_2_9.viz = gradientBar(visuals.viz_2_9.data, visuals.viz_2_9.options.selector, "CM_SCORE", "United States")

    ////////////////////////////////
    ///////// viz updates //////////
    ////////////////////////////////

    const visUpdates = {
        track1: {
            "track1-trigger1": () => {
                console.log("Function for scrollTrack1, scrollTrigger1");
            },
        },
        "track2_5": {
            "track2_5-trigger1": () => {
                console.log("Function for track2_5-trigger1");
            },
            "track2_5-trigger2": () => {
                console.log("Function for track2_5-trigger2");
            },
            "track2_5-trigger3": () => {
                console.log("Function for track2_5-trigger3");
            },
            "track2_5-trigger4": () => {
                console.log("Function for track2_5-trigger4");
            },
        },
        toggle1: {
            "toggle1-option1": () => {
                console.log("Function for toggleWrapper1, toggleSwitch1");
            },
        },
        dropdown1: {
            "dropdown1-option1": (selectedValue) => {
                console.log(`Function for dropdown1, dropdownOption1 with value: ${selectedValue}`);
            },
        },
    };

    ////////////////////////////////
    /////// event listeners ////////
    ////////////////////////////////

    const handleIntersection = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Extract IDs from the element and its parent
                const triggerId = entry.target.id;
                const trackId = entry.target.parentElement.id;

                // Check if the corresponding function exists in visUpdates
                if (
                    visUpdates.hasOwnProperty(trackId) &&
                    visUpdates[trackId].hasOwnProperty(triggerId)
                ) {
                    // Run the corresponding function
                    visUpdates[trackId][triggerId]();
                }

            }
        });
    };

    // Set up Intersection Observer for scroll triggers
    document.querySelectorAll('.scroll-track').forEach((scrollTrack) => {
        scrollTrack.querySelectorAll('.scroll-trigger').forEach((scrollTrigger) => {
            const observer = new IntersectionObserver(handleIntersection);
            observer.observe(scrollTrigger);
        });
    });


    // Event listener for toggle switches
    document.querySelectorAll('.toggle-wrapper').forEach((toggleWrapper) => {
        toggleWrapper.querySelectorAll('.toggle-switch').forEach((toggleSwitch) => {
            toggleSwitch.addEventListener('click', () => {
                // Extract IDs from the element and its parent
                const switchId = toggleSwitch.id;
                const wrapperId = toggleWrapper.id;

                // Check if the corresponding function exists in visUpdates
                if (
                    visUpdates.hasOwnProperty(wrapperId) &&
                    visUpdates[wrapperId].hasOwnProperty(switchId)
                ) {
                    // Run the corresponding function
                    visUpdates[wrapperId][switchId]();
                }
            });
        });
    });

    // Event listener for dropdowns
    document.querySelectorAll('.dropdown').forEach((dropdown) => {
        dropdown.addEventListener('change', (event) => {
            // Extract IDs from the element and its parent
            const selectedOption = event.target.value;
            const dropdownId = dropdown.id;

            // Check if the corresponding function exists in visUpdates
            if (visUpdates.hasOwnProperty(dropdownId) && visUpdates[dropdownId][selectedOption]) {
                // Run the corresponding function and pass the selected value
                visUpdates[dropdownId][selectedOption](selectedOption);
            }
        });
    });

})()