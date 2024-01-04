const data = new Array(12).fill(0);

d3.select('#rotatingPhotos').selectAll('.photo-frame')
  .data(data)
  .enter()
  .append('div')
  .style('width', '95px')
  .style('height', '95px')
  .attr('class', 'photo-frame')
  .style('transform', function() {
    // Generate a random rotation angle between -20 and 20 degrees for each photo frame
    const angle = Math.floor(Math.random() * 41) - 20;
    return `rotate(${angle}deg)`;
  })
  .append('img')
  .attr('src', 'https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/1.jpg') // Replace with the actual path to your images
  .attr('alt', 'Photo') 