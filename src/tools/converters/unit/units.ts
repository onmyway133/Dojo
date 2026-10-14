export interface UnitDef {
  id: string;
  label: string;
  symbol: string;
  /** A mathjs unit name, or a multiple of one for units mathjs doesn't ship (knot, calorie...). */
  mathjs: string;
  factor?: number;
}

export interface UnitCategory {
  id: string;
  name: string;
  /** Unit picked in "From" until the user chooses another. */
  defaultFrom: string;
  units: UnitDef[];
}

const u = (id: string, label: string, symbol: string, mathjs = id, factor?: number): UnitDef => ({ id, label, symbol, mathjs, factor });

/** US customary where US and imperial differ (gallon, cup, ton). */
export const categories: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    defaultFrom: "m",
    units: [
      u("nm", "Nanometer", "nm"), u("um", "Micrometer", "µm"), u("mm", "Millimeter", "mm"), u("cm", "Centimeter", "cm"),
      u("m", "Meter", "m"), u("km", "Kilometer", "km"), u("inch", "Inch", "in"), u("foot", "Foot", "ft"),
      u("yard", "Yard", "yd"), u("mile", "Mile", "mi"), u("nmi", "Nautical mile", "nmi", "m", 1852),
    ],
  },
  {
    id: "mass",
    name: "Mass",
    defaultFrom: "kg",
    units: [
      u("mg", "Milligram", "mg"), u("g", "Gram", "g"), u("kg", "Kilogram", "kg"), u("tonne", "Metric ton", "t"),
      u("ounce", "Ounce", "oz"), u("lb", "Pound", "lb"), u("stone", "Stone", "st"), u("ton", "US ton", "ton"),
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    defaultFrom: "degC",
    units: [u("degC", "Celsius", "°C"), u("degF", "Fahrenheit", "°F"), u("K", "Kelvin", "K")],
  },
  {
    id: "volume",
    name: "Volume",
    defaultFrom: "l",
    units: [
      u("ml", "Milliliter", "ml"), u("l", "Liter", "l"), u("m3", "Cubic meter", "m³"), u("teaspoon", "Teaspoon (US)", "tsp"),
      u("tablespoon", "Tablespoon (US)", "tbsp"), u("fluidounce", "Fluid ounce (US)", "fl oz"), u("cup", "Cup (US)", "cup"),
      u("pint", "Pint (US)", "pt"), u("quart", "Quart (US)", "qt"), u("gallon", "Gallon (US)", "gal"),
    ],
  },
  {
    id: "area",
    name: "Area",
    defaultFrom: "m2",
    units: [
      u("mm2", "Square millimeter", "mm²"), u("cm2", "Square centimeter", "cm²"), u("m2", "Square meter", "m²"),
      u("hectare", "Hectare", "ha"), u("km2", "Square kilometer", "km²"), u("sqin", "Square inch", "in²"),
      u("sqft", "Square foot", "ft²"), u("sqyd", "Square yard", "yd²"), u("acre", "Acre", "ac"), u("sqmi", "Square mile", "mi²"),
    ],
  },
  {
    id: "speed",
    name: "Speed",
    defaultFrom: "km/h",
    units: [
      u("m/s", "Meters per second", "m/s"), u("km/h", "Kilometers per hour", "km/h"), u("mi/h", "Miles per hour", "mph"),
      u("ft/s", "Feet per second", "ft/s"), u("kn", "Knot", "kn", "m/h", 1852),
    ],
  },
  {
    id: "time",
    name: "Time",
    defaultFrom: "s",
    units: [
      u("ns", "Nanosecond", "ns"), u("us", "Microsecond", "µs"), u("ms", "Millisecond", "ms"), u("s", "Second", "s"),
      u("minute", "Minute", "min"), u("hour", "Hour", "h"), u("day", "Day", "d"), u("week", "Week", "wk"),
      u("month", "Month (1/12 year)", "mo"), u("year", "Year (365.25 days)", "yr"),
    ],
  },
  {
    id: "data",
    name: "Data",
    defaultFrom: "MB",
    units: [
      u("b", "Bit", "bit"), u("B", "Byte", "B"), u("kB", "Kilobyte", "kB"), u("MB", "Megabyte", "MB"), u("GB", "Gigabyte", "GB"),
      u("TB", "Terabyte", "TB"), u("KiB", "Kibibyte", "KiB"), u("MiB", "Mebibyte", "MiB"), u("GiB", "Gibibyte", "GiB"),
      u("TiB", "Tebibyte", "TiB"), u("Mb", "Megabit", "Mbit"), u("Gb", "Gigabit", "Gbit"),
    ],
  },
  {
    id: "pressure",
    name: "Pressure",
    defaultFrom: "bar",
    units: [
      u("Pa", "Pascal", "Pa"), u("kPa", "Kilopascal", "kPa"), u("bar", "Bar", "bar"), u("atm", "Atmosphere", "atm"),
      u("psi", "Pound per square inch", "psi"), u("mmHg", "Millimeter of mercury", "mmHg"),
    ],
  },
  {
    id: "energy",
    name: "Energy",
    defaultFrom: "kJ",
    units: [
      u("J", "Joule", "J"), u("kJ", "Kilojoule", "kJ"), u("cal", "Calorie", "cal", "J", 4.184), u("kcal", "Kilocalorie", "kcal", "J", 4184),
      u("Wh", "Watt hour", "Wh"), u("kWh", "Kilowatt hour", "kWh"), u("BTU", "British thermal unit", "BTU"), u("eV", "Electronvolt", "eV"),
    ],
  },
  {
    id: "power",
    name: "Power",
    defaultFrom: "W",
    units: [u("W", "Watt", "W"), u("kW", "Kilowatt", "kW"), u("MW", "Megawatt", "MW"), u("hp", "Horsepower", "hp")],
  },
  {
    id: "angle",
    name: "Angle",
    defaultFrom: "deg",
    units: [u("deg", "Degree", "°"), u("rad", "Radian", "rad"), u("grad", "Gradian", "gon"), u("cycle", "Turn", "tr")],
  },
  {
    id: "frequency",
    name: "Frequency",
    defaultFrom: "Hz",
    units: [u("Hz", "Hertz", "Hz"), u("kHz", "Kilohertz", "kHz"), u("MHz", "Megahertz", "MHz"), u("GHz", "Gigahertz", "GHz")],
  },
];
