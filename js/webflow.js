// © 2024 Data Culture
// Released under the ISC license.
// https://studio.datacult.com/

import { sankey } from "./highFi/1_1.js";
import { viz_1_2 } from "./1_2.js";
import { Table_1_3 } from "./highFi/1_3.js";
import { viz_1_5 } from "./1_5.js";
import { circlepack } from './pack.js';
import { barArc } from './bararc.js';
import { Treemap } from "./highFi/2_2.js";
import { Table_2_3 } from "./highFi/2_3.js";
import { viz_2_6 } from "./2_6.js";
import { cluster } from './cluster.js';
import { viz_2_8 } from "./highFi/2_8.js";
import { viz_2_9 } from "./2_9.js";
import { gradientBarMapComponent } from "./lowFi/2_10_gradientBar.js";
import { choropleth } from './choropleth.js';
import { scatter } from './scatter.js';
import { drawSingleValues } from "./highFi/single_values.js";
(async () => {
    // hold data and vizualization instance in one object
    // all update functions should take the data as the first argument
    let visuals = {
        viz_1_1: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_1_1",
            },
            mapping: {
                source: "SOURCE",
                target: "TARGET",
                value: "VALUE",
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_1_2: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_1_2",
            },
            mapping: {},
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_1_3: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "viz_1_3",
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_1_4: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_1_4",
            },
            mapping: {
                source: "SOURCE",
                target: "TARGET",
                value: "VALUE",
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_1_5: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_1_5",
            },
            mapping: {},
            params: ["Gained in 2023", "All Time"],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_1: {
            viz: null,
            data: [],
            pending_data_update: false,
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
                if (param !== undefined && param !== null) {
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
            pending_data_update: false,
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
                    console.log("2_2 options: ", this.options)
                    this.viz.update(this.data, this.options);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_3: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "viz_2_3",
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_5: {
            viz: null,
            data: [],
            pending_data_update: false,
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
                if (param !== undefined && param !== null) {
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
                } else {
                    this.viz.bar.update(this.data);
                }
            },
        },
        viz_2_6: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_2_6",
            },
            mapping: {
                date: 'RELEASE_DATE',
                value: 'DAILY_TRACK_RELEASE_COUNT'
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_7: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_2_7",
                stroke: "white",
                format: (d) => {
                    return Math.floor(d * 100) > 0 ? d3.format(".0%")(d) : d3.format(".1r")(d * 100) + "%"
                }
            },
            mapping: {
                size: "ARTIST_COUNT",
                label: "PRONOUN",
                fill: "PRONOUN",
                value: "PRONOUN_PCT"
            },
            params: ['start'],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update();
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_8: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_2_8",
                fill: "#1781F7",
                stroke: "black",
                focus: "Drake"
            },
            mapping: {
                x: 'MONTH_LABEL',
                y: 'MONTHLY_ARTIST_RANK',
                group: 'NAME',
                sort: 'SCORE_MONTH',
                title: 'NAME',
                location: 'ARTIST_HOME_COUNTRY',
                flag: "COUNTRY_CODE",
                type: 'ARTIST_TYPE',
                artist_image: 'IMAGE_URL',
                pronouns: 'PRONOUN',
                months_in_top_10: 'MONTHS_IN_TOP_10'
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_9: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_2_9",
                filter: "All Countries"
            },
            mapping: {
                label: "ARTIST_NAME",
                y: "COUNTRY_RANK",
                x: "CM_SCORE",
                image: "IMAGE_URL",
                filter: "COUNTRY_NAME",
                stage: "ARTIST_STAGE",
                sort: "COUNTRY_RANK",
                genre: "ARTIST_GENRES",
                country: "COUNTRY_NAME"
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.options.filter = param;
                    this.viz.update(null, null, this.options);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_10: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "viz_2_10",
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_11: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_2_11",
                stroke: "white",
                width: 1000
            },
            mapping: {
                x: "ORDERING",
                y: "TRACKS_PER_ARTIST",
                size: "ARTIST_COUNT",
                label: "GENRE_NAME",
                fill: "GENRE_NAME",
                sort: "ARTIST_COUNT",
                focus: "ORDERING"
            },
            params: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.options.focus = [param]
                    if (param === 12) this.options.focus = [2, 3, 5, 6, 9, 10, 11, 12]
                    if (param === 0) this.options.focus = []
                    this.viz.update(null, null, this.options);
                } else {
                    this.viz.update(this.data);
                }
            },
        },

        viz_2_13: {
            viz: null,
            data: [],
            pending_data_update: false,
            options: {
                selector: "#viz_2_13",
                title: "No. of Artists"
            },
            mapping: {
                id: 'COUNTRY_NAME',
                value: 'ARTIST_COUNT',
                label: 'COUNTRY_NAME'
            },
            params: [],
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
        viz_2_14: {
            viz: null,
            data: [],
            pending_data_update: false,
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
                if (param !== undefined && param !== null) {
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
            pending_data_update: false,
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
                if (param !== undefined && param !== null) {
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
            pending_data_update: false,
            options: {
                selector: "viz_2_19",
            },
            update: function (param) {
                if (param !== undefined && param !== null) {
                    this.viz.update(null, param);
                } else {
                    this.viz.update(this.data);
                }
            },
        },
    };

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
        const radioMap = document.querySelector('.radio_map');
        if (radioMap) radioMap.remove();
    };


    let loadVisualCheck = {}

    Object.keys(visuals).forEach((viz) => {
        let selector = visuals[viz].options.selector
        if (selector[0] != "#") selector = "#" + selector
        loadVisualCheck[viz] = document.querySelector(selector) ? true : false
    });


    ///////////////////////////
    ///////// data ////////////
    ///////////////////////////

    async function loadData(lan, update = false) {
        await Promise.all(
            Object.keys(visuals).map((viz) => {
                if (loadVisualCheck[viz] == true) {
                    return d3
                        .csv(
                            `https://share.chartmetric.com/year-end-report/2023/${viz}_${lan}.csv`,
                            d3.autoType
                        )
                        .then((data) => {
                            return { name: viz, data: data };
                        })
                        .catch((error) => {
                            return null;
                        });
                } else {
                    return null;
                }
            })
        ).then(function (results) {
            results.forEach((result) => {
                if (result) {
                    visuals[result.name].data = result.data;
                    visuals[result.name].pending_data_update = true
                }
            });
        });

        // only update the visuals if the update flag is true
        if (update == true) {
            Object.keys(visuals).forEach((viz) => {
                if (visuals[viz].viz != null) {
                    // new data gets updated in no param is passed
                    if (visuals[viz].pending_data_update == true) {
                        visuals[viz].update();
                        visuals[viz].pending_data_update = false
                    }
                }
            });
        }

        console.log("data load complete")
    }

    ///////////////////////////
    /////// language //////////
    ///////////////////////////

    // // grab the selected language from dropdown on initial load
    let language = "en"

    await loadData(language);

    const list = document.getElementById('weglot-listbox');
    if (list) list.addEventListener('click', function (event) {
        let targetElement = event.target;

        while (targetElement && targetElement !== this) {
            if (targetElement.tagName === 'LI') {
                language = targetElement.getAttribute("data-l")
                console.log('new language selected: ', language);
                // loadData(language, true);
                break;
            }

            // Move up the DOM tree to check if we're clicking inside a list item
            targetElement = targetElement.parentNode;
        }
    });

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

    Object.keys(visuals).forEach((viz) => {
        if (loadVisualCheck[viz] == true) {
            let observer = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {

                        if (viz == "viz_1_1") {
                            visuals.viz_1_1.viz = sankey(
                                visuals.viz_1_1.data,
                                visuals.viz_1_1.mapping,
                                visuals.viz_1_1.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_1_2") {
                            visuals.viz_1_2.viz = viz_1_2(
                                visuals.viz_1_2.data,
                                visuals.viz_1_2.mapping,
                                visuals.viz_1_2.options,
                            );
                            observer.disconnect();

                        }
                        if (viz == "viz_1_3") {
                            visuals.viz_1_3.viz = Table_1_3(
                                visuals.viz_1_3.data,
                                visuals.viz_1_3.options.selector
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_1_4") {
                            visuals.viz_1_4.viz = sankey(
                                visuals.viz_1_4.data,
                                visuals.viz_1_4.mapping,
                                visuals.viz_1_4.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_1_5") {
                            visuals.viz_1_5.viz = viz_1_5(
                                visuals.viz_1_5.data,
                                visuals.viz_1_5.mapping,
                                visuals.viz_1_5.options,
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_1") {
                            visuals.viz_2_1.viz = circlepack(
                                visuals.viz_2_1.data,
                                visuals.viz_2_1.mapping,
                                visuals.viz_2_1.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_2") {
                            visuals.viz_2_2.viz = Treemap(
                                visuals.viz_2_2.data,
                                visuals.viz_2_2.options.selector,
                                visuals.viz_2_2.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_3") {
                            visuals.viz_2_3.viz = Table_2_3(
                                visuals.viz_2_3.data,
                                visuals.viz_2_3.options.selector
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_5") {
                            visuals.viz_2_5.viz = barArc(
                                visuals.viz_2_5.data,
                                visuals.viz_2_5.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_6") {
                            visuals.viz_2_6.viz = viz_2_6(
                                visuals.viz_2_6.data,
                                visuals.viz_2_6.mapping,
                                visuals.viz_2_6.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_7") {
                            visuals.viz_2_7.viz = cluster(
                                visuals.viz_2_7.data,
                                visuals.viz_2_7.mapping,
                                visuals.viz_2_7.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_8") {
                            visuals.viz_2_8.viz = viz_2_8(
                                visuals.viz_2_8.data,
                                visuals.viz_2_8.mapping,
                                visuals.viz_2_8.options,
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_9") {
                            visuals.viz_2_9.viz = viz_2_9(
                                visuals.viz_2_9.data,
                                visuals.viz_2_9.mapping,
                                visuals.viz_2_9.options,
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_10") {
                            visuals.viz_2_10.viz = gradientBarMapComponent(
                                visuals.viz_2_10.data,
                                visuals.viz_2_10.options.selector
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_11") {
                            visuals.viz_2_11.viz = scatter(
                                visuals.viz_2_11.data,
                                visuals.viz_2_11.mapping,
                                visuals.viz_2_11.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_13") {
                            visuals.viz_2_13.viz = choropleth(
                                visuals.viz_2_13.data,
                                visuals.viz_2_13.mapping,
                                visuals.viz_2_13.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_14") {
                            visuals.viz_2_14.viz = circlepack(
                                visuals.viz_2_14.data,
                                visuals.viz_2_14.mapping,
                                visuals.viz_2_14.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_15") {
                            visuals.viz_2_15.viz = circlepack(
                                visuals.viz_2_15.data,
                                visuals.viz_2_15.mapping,
                                visuals.viz_2_15.options
                            );
                            observer.disconnect();
                        }
                        if (viz == "viz_2_19") {
                            visuals.viz_2_19.viz = drawSingleValues(
                                visuals.viz_2_19.options.selector
                            );
                            observer.disconnect();
                        }
                        console.log("visual loaded: ", viz);
                    }
                });
            });

            let selector = visuals[viz].options.selector
            if (selector[0] != "#") selector = "#" + selector

            observer.observe(document.querySelector(selector));
        }
    });

    ////////////////////////////////
    /////// event listeners ////////
    ////////////////////////////////

    function hideTooltips() {
        const tooltips = document.querySelectorAll('.tooltip');

        tooltips.forEach(tooltip => {
            tooltip.style.display = 'none';
        });
    }

    window.addEventListener('scroll', hideTooltips);

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