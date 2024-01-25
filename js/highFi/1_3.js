export function Table_1_3(data = [], selector = "vis", platform = "Spotify") {
  console.log(data);
  console.log(selector)
  function draw() {

    // Filtering objects based on the 'Platform' property
    const filteredData = data.filter(track => track["PLATFORM"] === platform);

    console.log(filteredData);

    // Sorting filtered array based on 'track_rank' in ascending order
    const sortedArray = filteredData.sort((a, b) => a.track_rank - b.track_rank);

    // Rendering HTML elements to element with selector
    const wrapper = document.getElementById(selector);

    // Remove any existing elements from previous render
    const elementsToRemove = document.querySelectorAll('.box1');

    // Removing each found element
    elementsToRemove.forEach(element => {
    element.remove();
    });

    // sortedArray.forEach(obj => {
    // const htmlElement = document.createElement('div');
    // htmlElement.className = "box1";
    // htmlElement.innerHTML = `
    //     <div class="rank">${obj["TRACK_RANK"]}</div>
    //     <img src="${obj["IMAGE_URL"]}" alt="${obj["ARTIST_NAME"]}" style="width:100px;height:100px;">
    //     <div class="track-text">
    //         <div class="header">${obj["TRACK_NAME"]}</div>
    //         <div class="subheader"><span class="color-bar"></span>${obj["ARTIST_NAME"]}</div>
    //     </div>
    // `;
    // wrapper.appendChild(htmlElement);
    // });

    for (const obj of sortedArray) {
        const htmlElement = document.createElement('div');
        htmlElement.className = "box1";
        htmlElement.innerHTML = `
            <div class="rank">${obj["TRACK_RANK"]}</div>
            <img src="${obj["IMAGE_URL"]}" alt="${obj["ARTIST_NAME"]}" style="width:100px;height:100px;">
            <div class="track-text">
                <div class="header">${obj["TRACK_NAME"]}</div>
                <div class="subheader"><span class="color-bar"></span>${obj["ARTIST_NAME"]}</div>
            </div>
        `;
        wrapper.appendChild(htmlElement);
      }

  }
  function update(data) {
    draw();
  }
  update(data)
  return {
    update: update,
  };
}
