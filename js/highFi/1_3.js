export function Table_1_3(data = [], selector = "vis") {
  console.log(data);
  function draw() {
    d3.select("#" + selector).html(`
    <div class="box1">
        <div class="rank">1</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">2</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">3</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">4</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">5</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">6</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">7</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">8</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">9</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>
    <div class="box1">
        <div class="rank">10</div>
        <figure></figure>
        <div class="track-text">
            <div class="header">Redacted Text is here</div>
            <div class="subheader"><span class="color-bar"></span>sub redacted text</div>
        </div>
    </div>

`);
  }
  function update(data) {
    draw();
  }
  update(data)
  return {
    update: update,
  };
}
