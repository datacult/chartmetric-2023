export function Table_1_3(data = [], selector = "vis", platform = "Radio") {

  function update(newData = data, newPlatform = platform) {
    data = newData != null ? newData : data
    platform = newPlatform

    console.log('table_1_3 update', data, platform);

    // Filtering objects based on the 'Platform' property
    const filteredData = data.filter(track => track["PLATFORM"] === platform);

    // Sorting filtered array based on 'track_rank' in ascending order
    const sortedArray = filteredData.sort((a, b) => a.TRACK_RANK - b.TRACK_RANK);

    console.log(sortedArray)

    // Rendering HTML elements to element with selector
    const wrapper = document.getElementById(selector);

    // Remove any existing elements from previous render
    const elementsToRemove = document.querySelectorAll('.box1');

    // Removing each found element
    elementsToRemove.forEach(element => {
      element.remove();
    });

    sortedArray.forEach(obj => {
      const htmlElement = document.createElement('div');
      htmlElement.className = "box1";
      htmlElement.innerHTML = `
        <div class="rank">${obj["TRACK_RANK"]}</div>
        <img class="rank-img" src="${obj["IMAGE_URL"]}" alt="${obj["ARTIST_NAME"]}">
        <div class="track-text">
            <div class="header">${obj["TRACK_NAME"]}</div>
            <div class="subheader"><span class="color-bar"></span>${obj["ARTIST_NAME"]}</div>
        </div>
    `;
      wrapper.appendChild(htmlElement);
    });

  }

  update()

  return {
    update: update,
  };
}
