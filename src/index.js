import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)
const SPACEX_ID = 121;

function setup() {
    const api = new SpaceX();

    api.launches(30, SPACEX_ID)
        .then(launches => {
            const spaceXLaunches = launches.filter(launch =>
                launch.launch_service_provider &&
                launch.launch_service_provider.id === SPACEX_ID
            );

            const listContainer = document.getElementById("listContainer");
            renderLaunches(spaceXLaunches, listContainer);
            drawMap(uniquePads(spaceXLaunches));
        })
        .catch(err => {
            console.error(err);
            document.getElementById("listContainer").textContent =
                "Не удалось загрузить данные).";
        });
}

function uniquePads(launches) {
    const pads = new Map();
    launches.forEach(launch => {
        if (launch.pad) {
            pads.set(launch.pad.id, launch.pad);
        }
    });
    return Array.from(pads.values());
}

function renderLaunches(launches, container) {
    const list = document.createElement("ul");
    launches.forEach(launch => {
        const item = document.createElement("li");
        item.textContent = launch.name;

        item.addEventListener("mouseenter", () => {
            item.classList.add("active");
            highlightLaunchpad(launch.pad ? launch.pad.id : null);
        });
        item.addEventListener("mouseleave", () => {
            item.classList.remove("active");
            highlightLaunchpad(null);
        });

        list.appendChild(item);
    });
    container.replaceChildren(list);
}

function drawMap(launchpads) {
    const width = 640;
    const height = 480;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};

    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([width / 2 - margin.left, height / 2]);

    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", "#cccccc")
        .style("opacity", .7);

    const features = launchpads
        .filter(pad => pad.latitude != null && pad.longitude != null)
        .map(pad => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [+pad.longitude, +pad.latitude]
            },
            properties: {
                id: pad.id,
                name: pad.name
            }
        }));

    svg.append("g")
        .selectAll("circle")
        .data(features)
        .enter()
        .append("circle")
        .attr("class", "launchpad")
        .attr("cx", d => projection(d.geometry.coordinates)[0])
        .attr("cy", d => projection(d.geometry.coordinates)[1])
        .attr("r", 3)
        .attr("fill", "#005288")
        .append("title")
        .text(d => d.properties.name);
}

function highlightLaunchpad(padId) {
    d3.selectAll("circle.launchpad")
        .classed("active", d => d.properties.id === padId)
        .attr("r", d => d.properties.id === padId ? 7 : 3)
        .attr("fill", d => d.properties.id === padId ? "#e63946" : "#005288");
}