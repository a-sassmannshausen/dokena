import {} from "piu/MC";

const backgroundSkin = new Skin({	fill: "black" });
const headerSkin = new Skin({ fill: "white" });
const headerStyle = new Style({ font: "bold 18px Gothic", color: "black" });
const bodyStyle = new Style({ font: "bold 42px Bitham", color: "white" });
const dateStyle = new Style({ font: "bold 24px Gothic", color: "white" });

const MONTH_OFFSETS = [
    0, 31, 59, 90, 120, 151,
    181, 212, 243, 273, 304, 334
];

const DIGITS = "0123456789AB";

function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

function formatDozenalTime(date) {
	const seconds = date.getHours() * 3600 + date.getMinutes() * 60 +
		date.getSeconds();

	// Number of 1/1728-day ticks since midnight.
	const ticks = Math.floor(seconds * 1728 / 86400);
  return (
      DIGITS[(ticks / 144) | 0] +
      DIGITS[((ticks / 12) | 0) % 12] +
      DIGITS[ticks % 12]
  );
}

function formatDate(date) {
  const y = date.getFullYear() + 10000; // Holocene Year
  const m = date.getMonth();
  const d = date.getDate();

  // -------- DAY OF YEAR --------
  let doy = MONTH_OFFSETS[m] + d - 1; // Our year starts on 0
  if (m > 1 && isLeapYear(y)) doy++;
  
  const year =
        DIGITS[(y / 1728) | 0] +
        DIGITS[((y / 144) | 0) % 12] +
        DIGITS[((y / 12) | 0) % 12] +
        DIGITS[y % 12];
  const day =
        DIGITS[(doy / 144) | 0] +
        DIGITS[((doy / 12) | 0) % 12] +
        DIGITS[doy % 12];
  return year + " " + day;
}

class ClockBehavior extends Behavior {
  lastTicks = -1;

  check(seconds) {
		const ticks = Math.floor(seconds * 1728 / 86400);
		
    if (ticks === this.lastTicks) {
      return false;
    } else {
      this.lastTicks = ticks;
      return true;
    }
  }

	update(label) {
		const now = new Date();

		const seconds =
			now.getHours() * 3600 +
			now.getMinutes() * 60 +
			now.getSeconds();

    if (this.check(seconds))
  		label.string = formatDozenalTime(now);
	}

	onDisplaying(label) {
    watch.addEventListener("secondchange", () => { this.update(label) });
    this.update(label);
	}
}

class DateBehavior extends Behavior {
  update(label) {
    const now = new Date();
    label.string = formatDate(now);
  }
  onDisplaying(label) {
    watch.addEventListener("daychange", () => { this.update(label) });
    this.update(label);
  }
}

const application = new Application(null, {
    skin: backgroundSkin,
    contents: [
      new Row(null, {
        contents: [
          new Column(null, {
            contents: [
              new Label(null, {
                skin: backgroundSkin,
                style: bodyStyle,
                Behavior: ClockBehavior
              }),                          
              new Label(null, {
                skin: backgroundSkin,
                style: dateStyle,
                Behavior: DateBehavior
              })
            ]
          })
        ]
      })
    ]
});