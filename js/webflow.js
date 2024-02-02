// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/

// import { Sankey } from "./highFi/1_1.js";
import { Table_1_3 } from "./highFi/1_3.js";
import { circlepacking_1_5 } from "./highFi/1_5.js";
import { circlepack } from './pack.js';
import { barArc } from './bararc.js';
import { Treemap } from "./highFi/2_2.js";
import { Table_2_3 } from "./highFi/2_3.js";
import { Calendar } from "./highFi/2_6.js";
import { cluster } from './cluster.js';
import { BumpChart } from "./highFi/2_8.js";
import { gradientBar } from "./highFi/2_9.js";
import { gradientBarMapComponent } from "./lowFi/2_10_gradientBar.js";
import { scatter } from './scatter.js';
import { SingleValues } from "./highFi/single_values.js";
(async () => {
    // hold data and vizualization instance in one object
    // all update functions should take the data as the first argument
    let visuals = {
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
            params: ["Gained in 2023", "All Time"],
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
                selector: "#viz_2_1",
                fill: "black",
                stroke: "white",
                background: "https://datacult.github.io/chartmetric-2023/assets/2_1_gradient.svg",
                blend: "soft-light"
            },
            mapping: {
                value: "PEAK_CM_SCORE",
                label: "ARTIST_NAME",
                group: "COUNTRY_NAME",
                image: "IMAGE_URL"
            },
            params: ["COUNTRY_NAME", "GENDER"],
            update: function (param) {
                if (param) {
                    this.mapping.group = param;
                    this.viz.update(null, this.mapping);
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
                genreType: "Artist Genres",
                timeframe: "All Time"
            },
            params: [["Artist Genres", "Track Genres"], ["All Time", 2023]],
            update: function (param, index) {
                if (param && index) {
                    if (index == 0) {
                        this.options.genreType = param;
                    }
                    if (index == 1) {
                        this.options.timeframe = param;
                    }
                    this.viz.update(this.data, this.options);
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
                    this.viz.bar.update(null, { y: param.bar }, { focus: param.arc.focus });
                } else {
                    this.viz.bar.update(this.data);
                }

                if (param.hasOwnProperty("arc")) {
                    this.viz.arc.update(null, { focus: param.arc.focus }, { opacity: param.arc.opacity });
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
        viz_2_7: {
            viz: null,
            data: [],
            options: {
                selector: "#viz_2_7",
                stroke: "white",
            },
            mapping: {
                size: "ARTIST_COUNT",
                label: "PRONOUN",
                fill: "PRONOUN",
                value: "PRONOUN_PCT"
            },
            params: ['start'],
            update: function (param) {
                if (param) {
                    this.viz.update();
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
                selector: "#viz_2_11",
                stroke: "white",
            },
            mapping: {
                x: "ORDERING",
                y: "TRACKS_PER_ARTIST",
                size: "ARTIST_COUNT",
                label: "GENRE_NAME",
                fill: "GENRE_NAME",
                focus: "ORDERING"
            },
            params: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            update: function (param) {
                if (param) {
                    this.options.focus = [param]
                    this.viz.update(null, null, this.options);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_14: {
            viz: null,
            data: [],
            options: {
                selector: "#viz_2_14",
                fill: "black",
                stroke: "white",
                text: "white",
                background: "https://datacult.github.io/chartmetric-2023/assets/2_14_gradient.svg",
                blend: "soft-light"
            },
            mapping: {
                group: "GENRE",
                label: "NAME",
                image: "IMAGE_URL",
                filter: {
                    TYPE: "track"
                }
            },
            params: ["track", "artist"],
            update: function (param) {
                if (param) {
                    this.mapping.filter.TYPE = param;
                    this.viz.update(null, this.mapping);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_15: {
            viz: null,
            data: [],
            options: {
                selector: "#viz_2_15",
                fill: "black",
                stroke: "white",
                text: "white",
                background: "https://datacult.github.io/chartmetric-2023/assets/2_15_gradient.svg",
                blend: "soft-light"
            },
            mapping: {
                group: "COUNTRY",
                label: "TRACK_NAME",
                image: "IMAGE_URL"
            },
            params: ["COUNTRY", "GENRE"],
            update: function (param) {
                if (param) {
                    this.mapping.group = param;
                    this.viz.update(null, this.mapping);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_19: {
            viz: null,
            data: [],
            options: {
                selector: "viz_2_19",
            },
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

    let platformDropdownSpan = document.createElement("span");
    platformDropdownSpan.classList.add("arrow");

    let platformDropdownContainer = document.querySelector("#dropdown-1_3");
    let platformDropdown = document.createElement("select");
    platformDropdown.appendChild(platformDropdownSpan);

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

    if (platformDropdownContainer) platformDropdownContainer.appendChild(platformDropdown)

    let countryDropdownSpan = document.createElement("span");
    countryDropdownSpan.classList.add("arrow");

    let countryDropdownContainer = document.querySelector("#dropdown-2_9");
    let contryDropdown = document.createElement("select");
    contryDropdown.appendChild(countryDropdownSpan);

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

    if (countryDropdownContainer) countryDropdownContainer.appendChild(contryDropdown)

    ////////////////////////////////
    /////// load visuals ///////////
    ////////////////////////////////

    if (document.querySelector("#" + visuals.viz_1_1.options.selector)) {
        // visuals.viz_1_1.viz = Sankey(
        //     visuals.viz_1_1.data,
        //     visuals.viz_1_1.options.selector
        // );
    }
    if (document.querySelector("#" + visuals.viz_1_3.options.selector)) {
        visuals.viz_1_3.viz = Table_1_3(
            visuals.viz_1_3.data,
            visuals.viz_1_3.options.selector
        );
    }
    if (document.querySelector("#" + visuals.viz_1_5.options.selector)) {
        visuals.viz_1_5.viz = circlepacking_1_5(
            visuals.viz_1_5.data,
            visuals.viz_1_5.options.selector,
            "Gained in 2023"
        );
    }
    if (document.querySelector(visuals.viz_2_1.options.selector)) {
        visuals.viz_2_1.viz = circlepack(
            visuals.viz_2_1.data,
            visuals.viz_2_1.mapping,
            visuals.viz_2_1.options
        );
    }
    if (document.querySelector("#" + visuals.viz_2_2.options.selector)) {
        visuals.viz_2_2.viz = Treemap(
            visuals.viz_2_2.data,
            visuals.viz_2_2.options.selector,
            visuals.viz_2_2.options
        );
    }
    if (document.querySelector("#" + visuals.viz_2_3.options.selector)) {
        visuals.viz_2_3.viz = Table_2_3(
            visuals.viz_2_3.data,
            visuals.viz_2_3.options.selector
        );
    }
    if (document.querySelector(visuals.viz_2_5.options.selector)) {
        visuals.viz_2_5.viz = barArc(
            visuals.viz_2_5.data,
            visuals.viz_2_5.options
        );
    }
    if (document.querySelector("#" + visuals.viz_2_6.options.selector)) {
        visuals.viz_2_6.viz = Calendar(
            visuals.viz_2_6.data,
            visuals.viz_2_6.options.selector
        );
    }
    if (document.querySelector(visuals.viz_2_7.options.selector)) {
        visuals.viz_2_7.viz = cluster(
            visuals.viz_2_7.data,
            visuals.viz_2_7.mapping,
            visuals.viz_2_7.options
        );
    }
    if (document.querySelector("#" + visuals.viz_2_8.options.selector)) {
        visuals.viz_2_8.viz = BumpChart(
            visuals.viz_2_8.data,
            visuals.viz_2_8.options.selector,
            visuals.viz_2_8.mapping,
            visuals.viz_2_8.options,
            "section-2-8"
        );
    }
    if (document.querySelector("#" + visuals.viz_2_9.options.selector)) {
        visuals.viz_2_9.viz = gradientBar(
            visuals.viz_2_9.data,
            visuals.viz_2_9.options.selector,
            "All Countries"
        );
    }
    if (document.querySelector("#" + visuals.viz_2_10.options.selector)) {
        visuals.viz_2_10.viz = gradientBarMapComponent(
            visuals.viz_2_10.data,
            visuals.viz_2_10.options.selector
        );
    }
    if (document.querySelector(visuals.viz_2_11.options.selector)) {
        visuals.viz_2_11.viz = scatter(
            visuals.viz_2_11.data,
            visuals.viz_2_11.mapping,
            visuals.viz_2_11.options
        );
    }
    if (document.querySelector(visuals.viz_2_14.options.selector)) {
        visuals.viz_2_14.viz = circlepack(
            visuals.viz_2_14.data,
            visuals.viz_2_14.mapping,
            visuals.viz_2_14.options
        );
    }
    if (document.querySelector(visuals.viz_2_15.options.selector)) {
        visuals.viz_2_15.viz = circlepack(
            visuals.viz_2_15.data,
            visuals.viz_2_15.mapping,
            visuals.viz_2_15.options
        );
    }
    if (document.querySelector("#" + visuals.viz_2_19.options.selector)) {
        visuals.viz_2_19.viz = SingleValues(
        [],
            visuals.viz_2_19.options.selector
        );
    }

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
                const value = d3.autoType({ value: toggleSwitch.getAttribute("data") }).value;
                const viz_id = "viz_" + toggleWrapper.parentNode.id.split("-")[1]
                const index = toggleWrapper.getAttribute("index");

                console.log("toggle: ", viz_id, index, value);

                if (visuals.hasOwnProperty(viz_id)) {
                    if (Array.isArray(visuals[viz_id].params[index])) {
                        if (visuals[viz_id].params[index].indexOf(value) > -1) {
                            visuals[viz_id].update(value, index);
                        } else {
                            console.log("params detected as an array but value is not an accepted param", viz_id, index, value);
                        }
                    } else {
                        if (visuals[viz_id].params.indexOf(value) > -1) {
                            visuals[viz_id].update(value);
                        } else {
                            console.log("value is not an accepted param", viz_id, index, value);
                        }
                    }
                } else {
                    console.log("error, visual id not found", viz_id, index, value);
                }
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