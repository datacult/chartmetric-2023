// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/

import { Sankey } from "./highFi/1_1.js";
import { Table_1_3 } from "./highFi/1_3.js";
import { circlepacking_1_5 } from "./highFi/1_5.js";
import { circlepacking_2_1 } from "./highFi/2_1.js";
import { Treemap } from "./highFi/2_2.js";
import { Table_2_3 } from "./highFi/2_3.js";
import { Calendar } from "./highFi/2_6.js";
import { BumpChart } from "./highFi/2_8.js";
import { gradientBar } from "./highFi/2_9.js";
import { gradientBarMapComponent } from "./lowFi/2_10_gradientBar.js";
import { circlepacking_2_11 } from "./highFi/2_11.js";
import { SingleValues } from "./highFi/single_values.js";
(async () => {
    // hold data and vizualization instance in one object
    // all update functions should take the data as the first argument
    let visuals = {
        // viz_single_values: {
        //     viz: null,
        //     data: [],
        //     options: {
        //         selector: "viz_single_values",
        //     },
        //     update: function (param) {
        //         if (param) {
        //             this.viz.update(null, param);
        //         } else {
        //             this.viz.update(this.data);
        //         }
        //     },
        // },
        viz_1_1: {
            viz: null,
            data: [],
            options: {
                selector: "viz_1_1",
            },
            params: [],
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_1_3: {
            viz: null,
            data: [],
            options: {
                selector: "viz_1_3",
            },
            params: [], // unknown yet: the button value
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_1_5: {
            viz: null,
            data: [],
            options: {
                selector: "viz_1_5",
            },
            params: ["Gained in 2023"], // or "All Time"
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_1: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_1",
            },
            params: [],
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_2: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_2",
            },
            params: ["Artist Genres", "top_genres_for_artists_all_time"], // Or "Track Genres" + corresponding time
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_3: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_3",
            },
            params: [],
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_5: {
            viz: null,
            data: [],
            options: {
                selector: "#viz_2_5",
            },
            params: [
                // { bar: "start_total" },
                { bar: "end_total" },
                { arc: "Undiscovered" },
                { arc: "Developing" },
                { arc: "Mid-Level" },
                { arc: "Mainstream" },
                { arc: "Superstar" },
                { arc: "Legendary" },
            ],
            update: function (param) {
                // expects an object with 'bar' & 'arc' keys

                if (param.hasOwnProperty("bar")) {
                    this.viz.bar.update(null, { y: param.bar });
                } else {
                    this.viz.bar.update(this.data);
                }

                if (param.hasOwnProperty("arc")) {
                    this.viz.arc.update(null, { y: param.arc });
                } else {
                    this.viz.bar.update(this.data);
                }
            },
        },
        viz_2_6: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_6",
            },
            params: [],
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_8: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_8",
                fill: "#1781F7",
                stroke: "black",
            },
            mapping: {
                x: "SCORE_MONTH",
                y: "MONTHLY_ARTIST_RANK",
                group: "NAME",
            },
            params: ["Drake"],
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_9: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_9",
            },
            params: ["United States"], // Any selected country
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_10: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_10",
            },
            params: [],
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_11: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_11",
            },
            params: [],
            update: function (param) {
                if (param) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
    };

    ///////////////////////////
    ///////// data ////////////
    ///////////////////////////

    async function loadData(lan, update = false) {
        await Promise.all(
            Object.keys(visuals).map((viz) => {
                return d3
                    .csv(
                        `https://share.chartmetric.com/year-end-report/2023/${viz}_${lan}.csv`,
                        d3.autoType
                    )
                    .then((data) => {
                        return { name: viz, data: data };
                    });
            })
        ).then(function (results) {
            results.forEach((result) => {
                visuals[result.name].data = result.data;
            });
        });

        // only update the visuals if the update flag is true
        if (update == true) {
            Object.keys(visuals).forEach((viz) => {
                if (visuals[viz].viz != null) {
                    // data gets updated in no param is passed
                    visuals[viz].update();
                }
            });
        }

        console.log("data load complete")
    }

    ///////////////////////////
    /////// language //////////
    ///////////////////////////

    // // grab the selected language from dropdown on initial load
    // let language = document.querySelector("#language").value;

    await loadData("en");

    // document.querySelector("#language").addEventListener("change", async (e) => {
    //     // check the language has changed
    //     if (e.target.value != language) {
    //         language = e.target.value;
    //         await loadData(language, true);
    //     }
    // });

    ////////////////////////////////
    ///// populate dropdown ////////
    ////////////////////////////////

    // let artistDropdown = document.querySelector("#artist");

    // let artist_names = visuals.viz_2_9.data.sort((a, b) =>
    //     d3.descending(a.CM_SCORE, b.CM_SCORE)
    // );
    // artist_names = artist_names.map((d) => d.ARTIST_NAME);
    // artist_names = artist_names.slice(0, 10);

    // artist_names.forEach((artist) => {
    //     let option = document.createElement("option");
    //     option.text = artist;
    //     artistDropdown.add(option);
    // });

    ////////////////////////////////
    /////// load visuals ///////////
    ////////////////////////////////
    // visuals.viz_single_values.viz = SingleValues(
    // [],
    //     visuals.viz_single_values.options.selector
    // );
    // visuals.viz_1_1.viz = Sankey(
    //     visuals.viz_1_1.data,
    //     visuals.viz_1_1.options.selector
    // );
    // visuals.viz_1_3.viz = Table_1_3(
    //     visuals.viz_1_3.data,
    //     visuals.viz_1_3.options.selector
    // );
    // visuals.viz_1_5.viz = circlepacking_1_5(
    //     visuals.viz_1_5.data,
    //     visuals.viz_1_5.options.selector,
    //     "Gained in 2023"
    // );
    // visuals.viz_2_1.viz = circlepacking_2_1(
    //     visuals.viz_2_1.data,
    //     visuals.viz_2_1.options.selector
    // );
    // visuals.viz_2_2.viz = Treemap(
    //     visuals.viz_2_2.data,
    //     visuals.viz_2_2.options.selector,
    //     "Artist Genres",
    //     "top_genres_for_artists_all_time"
    // );
    // visuals.viz_2_3.viz = Table_2_3(
    //     visuals.viz_2_3.data,
    //     visuals.viz_2_3.options.selector
    // );
    visuals.viz_2_5.viz = barArc(
        visuals.viz_2_5.data,
        visuals.viz_2_5.options
    );
    // visuals.viz_2_6.viz = Calendar(
    //     visuals.viz_2_6.data,
    //     visuals.viz_2_6.options.selector
    // );
    // visuals.viz_2_8.viz = BumpChart(
    //     visuals.viz_2_8.data,
    //     visuals.viz_2_8.options.selector,
    //     visuals.viz_2_8.mapping,
    //     visuals.viz_2_8.options,
    //     "section-2-8"
    // );
    // visuals.viz_2_9.viz = gradientBar(
    //     visuals.viz_2_9.data,
    //     visuals.viz_2_9.options.selector,
    //     "United States"
    // );
    // visuals.viz_2_10.viz = gradientBarMapComponent(
    //     visuals.viz_2_10.data,
    //     visuals.viz_2_10.options.selector
    // );
    // visuals.viz_2_11.viz = circlepacking_2_11(
    //     visuals.viz_2_11.data,
    //     visuals.viz_2_11.options.selector
    // );

    //! Gordon Ignore below for now
    ////////////////////////////////
    ///////// viz updates //////////
    ////////////////////////////////

    const visUpdates = {
        track1: {
            "track1-trigger1": () => {
                console.log("Function for scrollTrack1, scrollTrigger1");
            },
        },
        track2_5: {
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
                console.log(
                    `Function for dropdown1, dropdownOption1 with value: ${selectedValue}`
                );
            },
        },
    };

    ////////////////////////////////
    /////// event listeners ////////
    ////////////////////////////////

    const handleIntersection = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const viz_id = entry.target.id.split("-")[0]
                const param_index = entry.target.id.split("-")[1]

                console.log("scroll trigger: ", viz_id, param_index);

                if (
                    visuals.hasOwnProperty(viz_id) &&
                    visuals[viz_id].params.length > param_index
                ) {
                    visuals[viz_id].update(visuals[viz_id].params[param_index]);
                } else {
                    console.log("error, params not found", viz_id, param_index);
                }
            }
        });
    };

    // Set up Intersection Observer for scroll triggers
    document.querySelectorAll(".scroll-track").forEach((scrollTrack) => {
        scrollTrack.querySelectorAll(".scroll-trigger").forEach((scrollTrigger) => {
            const observer = new IntersectionObserver(handleIntersection);
            observer.observe(scrollTrigger);
        });
    });

    // Event listener for toggle switches
    document.querySelectorAll(".toggle-wrapper").forEach((toggleWrapper) => {
        toggleWrapper.querySelectorAll(".toggle-switch").forEach((toggleSwitch) => {
            toggleSwitch.addEventListener("click", () => {
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
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
        dropdown.addEventListener("change", (event) => {
            // Extract IDs from the element and its parent
            const selectedOption = event.target.value;
            const dropdownId = dropdown.id;

            // Check if the corresponding function exists in visUpdates
            if (
                visUpdates.hasOwnProperty(dropdownId) &&
                visUpdates[dropdownId][selectedOption]
            ) {
                // Run the corresponding function and pass the selected value
                visUpdates[dropdownId][selectedOption](selectedOption);
            }
        });
    });
})();
