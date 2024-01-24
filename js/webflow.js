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
            params: [],
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
            params: [true, false],
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
                { bar: "end_total", arc: { focus: null, opacity: 0 } },
                { bar: "end_total", arc: { focus: null, opacity: 0.03 } },
                { bar: "Undiscovered", arc: { focus: "Undiscovered", opacity: 0.03 } },
                { bar: "Developing", arc: { focus: "Developing", opacity: 0.03 } },
                { bar: "Mid-Level", arc: { focus: "Mid-Level", opacity: 0.03 } },
                { bar: "Mainstream", arc: { focus: "Mainstream", opacity: 0.03 } },
                { bar: "Superstar", arc: { focus: "Superstar", opacity: 0.03 } },
                { bar: "Legendary", arc: { focus: "Legendary", opacity: 0.03 } },
            ],
            update: function (param) {
                // expects an object with 'bar' & 'arc' keys

                if (param.hasOwnProperty("bar")) {
                    this.viz.bar.update(null, { y: param.bar });
                } else {
                    this.viz.bar.update(this.data);
                }

                if (param.hasOwnProperty("arc")) {
                    this.viz.arc.update(null, { focus: param.arc.focus }, {opacity: param.arc.opacity});
                } else {
                    this.viz.arc.update(this.data);
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
            params: [],
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
    ///// populate dropdowns ///////
    ////////////////////////////////

    let platformDropdownContainer = document.querySelector("#dropdown-1_3");
    let platformDropdown = document.createElement("select");

    let platforms = visuals.viz_1_3.data.sort((a, b) =>
        d3.ascending(a.PLATFORM, b.PLATFORM)
    );
    platforms = Array.from(new Set(platforms.map((d) => d.PLATFORM)));

    visuals.viz_1_3.params = platforms;

    platforms.forEach((country) => {
        let option = document.createElement("option");
        option.text = country;
        platformDropdown.add(option);
    });

    platformDropdownContainer.appendChild(platformDropdown)

    let countryDropdownContainer = document.querySelector("#dropdown-2_9");
    let contryDropdown = document.createElement("select");

    let countries = visuals.viz_2_9.data.sort((a, b) =>
        d3.ascending(a.COUNTRY_NAME, b.COUNTRY_NAME)
    );
    countries = Array.from(new Set(countries.map((d) => d.COUNTRY_NAME)));

    visuals.viz_2_9.params = countries;

    countries.forEach((country) => {
        let option = document.createElement("option");
        option.text = country;
        contryDropdown.add(option);
    });

    countryDropdownContainer.appendChild(contryDropdown)

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
    visuals.viz_1_3.viz = Table_1_3(
        visuals.viz_1_3.data,
        visuals.viz_1_3.options.selector
    );
    visuals.viz_1_5.viz = circlepacking_1_5(
        visuals.viz_1_5.data,
        visuals.viz_1_5.options.selector,
        "Gained in 2023"
    );
    visuals.viz_2_1.viz = circlepacking_2_1(
        visuals.viz_2_1.data,
        visuals.viz_2_1.options.selector
    );
    // visuals.viz_2_2.viz = Treemap(
    //     visuals.viz_2_2.data,
    //     visuals.viz_2_2.options.selector,
    //     "Artist Genres",
    //     "top_genres_for_artists_all_time"
    // );
    visuals.viz_2_3.viz = Table_2_3(
        visuals.viz_2_3.data,
        visuals.viz_2_3.options.selector
    );
    visuals.viz_2_5.viz = barArc(
        visuals.viz_2_5.data,
        visuals.viz_2_5.options
    );
    visuals.viz_2_6.viz = Calendar(
        visuals.viz_2_6.data,
        visuals.viz_2_6.options.selector
    );
    visuals.viz_2_8.viz = BumpChart(
        visuals.viz_2_8.data,
        visuals.viz_2_8.options.selector,
        visuals.viz_2_8.mapping,
        visuals.viz_2_8.options,
        "section-2-8"
    );
    visuals.viz_2_9.viz = gradientBar(
        visuals.viz_2_9.data,
        visuals.viz_2_9.options.selector,
        "United States"
    );
    visuals.viz_2_10.viz = gradientBarMapComponent(
        visuals.viz_2_10.data,
        visuals.viz_2_10.options.selector
    );
    visuals.viz_2_11.viz = circlepacking_2_11(
        visuals.viz_2_11.data,
        visuals.viz_2_11.options.selector
    );

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

                console.log(switchId, wrapperId, toggleSwitch, toggleWrapper)

                // if (
                //     visuals.hasOwnProperty(viz_id) &&
                //     visuals[viz_id].params.indexOf(value) > -1
                // ) {
                //     visuals[viz_id].update(value);
                // } else {
                //     console.log("error, params not found", viz_id, value);
                // }
            });
        });
    });

    // Event listener for dropdowns
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
        dropdown.addEventListener("change", (event) => {
            
            const value = event.target.value;
            const viz_id = 'viz_' + dropdown.id.split("-")[1];

            console.log("dropdown: ", viz_id, value);

            if (
                visuals.hasOwnProperty(viz_id) &&
                visuals[viz_id].params.indexOf(value) > -1
            ) {
                visuals[viz_id].update(value);
            } else {
                console.log("error, params not found", viz_id, value);
            }
        });
    });
})();
