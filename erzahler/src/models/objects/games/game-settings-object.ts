export interface GameSettings {
  scheduler: {
    turnOrder: ['orders', 'retreats', 'adjustments', 'nominations', 'votes'];
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayValues: {
      Sunday: 0;
      Monday: 1;
      Tuesday: 2;
      Wednesday: 3;
      Thursday: 4;
      Friday: 5;
      Saturday: 6;
    };
    timeZones: [
      {
        name: 'Pacific/Niue';
        alternativeName: 'Niue Time';
        group: ['Pacific/Niue'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Niue';
        countryCode: 'NU';
        mainCities: ['Alofi'];
        rawOffsetInMinutes: -660;
        abbreviation: 'NUT';
        rawFormat: '-11:00 Niue Time - Alofi';
        currentTimeOffsetInMinutes: -660;
        currentTimeFormat: '-11:00 Niue Time - Alofi';
      },
      {
        name: 'Pacific/Midway';
        alternativeName: 'Samoa Time';
        group: ['Pacific/Midway'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'United States Minor Outlying Islands';
        countryCode: 'UM';
        mainCities: ['Midway'];
        rawOffsetInMinutes: -660;
        abbreviation: 'SST';
        rawFormat: '-11:00 Samoa Time - Midway';
        currentTimeOffsetInMinutes: -660;
        currentTimeFormat: '-11:00 Samoa Time - Midway';
      },
      {
        name: 'Pacific/Pago_Pago';
        alternativeName: 'Samoa Time';
        group: ['Pacific/Pago_Pago', 'Pacific/Samoa', 'US/Samoa'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'American Samoa';
        countryCode: 'AS';
        mainCities: ['Pago Pago'];
        rawOffsetInMinutes: -660;
        abbreviation: 'SST';
        rawFormat: '-11:00 Samoa Time - Pago Pago';
        currentTimeOffsetInMinutes: -660;
        currentTimeFormat: '-11:00 Samoa Time - Pago Pago';
      },
      {
        name: 'Pacific/Rarotonga';
        alternativeName: 'Cook Islands Time';
        group: ['Pacific/Rarotonga'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Cook Islands';
        countryCode: 'CK';
        mainCities: ['Avarua'];
        rawOffsetInMinutes: -600;
        abbreviation: 'CKT';
        rawFormat: '-10:00 Cook Islands Time - Avarua';
        currentTimeOffsetInMinutes: -600;
        currentTimeFormat: '-10:00 Cook Islands Time - Avarua';
      },
      {
        name: 'America/Adak';
        alternativeName: 'Hawaii-Aleutian Time';
        group: ['America/Adak', 'America/Atka', 'US/Aleutian'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['Adak'];
        rawOffsetInMinutes: -600;
        abbreviation: 'HAST';
        rawFormat: '-10:00 Hawaii-Aleutian Time - Adak';
        currentTimeOffsetInMinutes: -600;
        currentTimeFormat: '-10:00 Hawaii-Aleutian Time - Adak';
      },
      {
        name: 'Pacific/Honolulu';
        alternativeName: 'Hawaii-Aleutian Time';
        group: ['Pacific/Honolulu', 'Pacific/Johnston', 'US/Hawaii'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['Honolulu', 'East Honolulu', 'Pearl City', 'Hilo'];
        rawOffsetInMinutes: -600;
        abbreviation: 'HAST';
        rawFormat: '-10:00 Hawaii-Aleutian Time - Honolulu, East Honolulu, Pearl City, Hilo';
        currentTimeOffsetInMinutes: -600;
        currentTimeFormat: '-10:00 Hawaii-Aleutian Time - Honolulu, East Honolulu, Pearl City, Hilo';
      },
      {
        name: 'Pacific/Tahiti';
        alternativeName: 'Tahiti Time';
        group: ['Pacific/Tahiti'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'French Polynesia';
        countryCode: 'PF';
        mainCities: ['Faaa', 'Papeete', 'Punaauia'];
        rawOffsetInMinutes: -600;
        abbreviation: 'TAHT';
        rawFormat: '-10:00 Tahiti Time - Faaa, Papeete, Punaauia';
        currentTimeOffsetInMinutes: -600;
        currentTimeFormat: '-10:00 Tahiti Time - Faaa, Papeete, Punaauia';
      },
      {
        name: 'Pacific/Marquesas';
        alternativeName: 'Marquesas Time';
        group: ['Pacific/Marquesas'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'French Polynesia';
        countryCode: 'PF';
        mainCities: ['Marquesas'];
        rawOffsetInMinutes: -570;
        abbreviation: 'MART';
        rawFormat: '-09:30 Marquesas Time - Marquesas';
        currentTimeOffsetInMinutes: -570;
        currentTimeFormat: '-09:30 Marquesas Time - Marquesas';
      },
      {
        name: 'America/Anchorage';
        alternativeName: 'Alaska Time';
        group: [
          'America/Anchorage',
          'America/Juneau',
          'America/Metlakatla',
          'America/Nome',
          'America/Sitka',
          'America/Yakutat',
          'US/Alaska'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['Anchorage', 'Juneau', 'Fairbanks', 'Eagle River'];
        rawOffsetInMinutes: -540;
        abbreviation: 'AKST';
        rawFormat: '-09:00 Alaska Time - Anchorage, Juneau, Fairbanks, Eagle River';
        currentTimeOffsetInMinutes: -540;
        currentTimeFormat: '-09:00 Alaska Time - Anchorage, Juneau, Fairbanks, Eagle River';
      },
      {
        name: 'Pacific/Gambier';
        alternativeName: 'Gambier Time';
        group: ['Pacific/Gambier'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'French Polynesia';
        countryCode: 'PF';
        mainCities: ['Gambier'];
        rawOffsetInMinutes: -540;
        abbreviation: 'GAMT';
        rawFormat: '-09:00 Gambier Time - Gambier';
        currentTimeOffsetInMinutes: -540;
        currentTimeFormat: '-09:00 Gambier Time - Gambier';
      },
      {
        name: 'America/Los_Angeles';
        alternativeName: 'Pacific Time';
        group: ['America/Los_Angeles', 'US/Pacific'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco'];
        rawOffsetInMinutes: -480;
        abbreviation: 'PST';
        rawFormat: '-08:00 Pacific Time - Los Angeles, San Diego, San Jose, San Francisco';
        currentTimeOffsetInMinutes: -480;
        currentTimeFormat: '-08:00 Pacific Time - Los Angeles, San Diego, San Jose, San Francisco';
      },
      {
        name: 'America/Tijuana';
        alternativeName: 'Pacific Time';
        group: ['America/Tijuana', 'America/Ensenada', 'America/Santa_Isabel', 'Mexico/BajaNorte'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Mexico';
        countryCode: 'MX';
        mainCities: ['Tijuana', 'Mexicali', 'Ensenada', 'Rosarito'];
        rawOffsetInMinutes: -480;
        abbreviation: 'PST';
        rawFormat: '-08:00 Pacific Time - Tijuana, Mexicali, Ensenada, Rosarito';
        currentTimeOffsetInMinutes: -480;
        currentTimeFormat: '-08:00 Pacific Time - Tijuana, Mexicali, Ensenada, Rosarito';
      },
      {
        name: 'America/Vancouver';
        alternativeName: 'Pacific Time';
        group: ['America/Vancouver', 'Canada/Pacific'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Vancouver', 'Surrey', 'Okanagan', 'Victoria'];
        rawOffsetInMinutes: -480;
        abbreviation: 'PST';
        rawFormat: '-08:00 Pacific Time - Vancouver, Surrey, Okanagan, Victoria';
        currentTimeOffsetInMinutes: -480;
        currentTimeFormat: '-08:00 Pacific Time - Vancouver, Surrey, Okanagan, Victoria';
      },
      {
        name: 'Pacific/Pitcairn';
        alternativeName: 'Pitcairn Time';
        group: ['Pacific/Pitcairn'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Pitcairn';
        countryCode: 'PN';
        mainCities: ['Adamstown'];
        rawOffsetInMinutes: -480;
        abbreviation: 'PST';
        rawFormat: '-08:00 Pitcairn Time - Adamstown';
        currentTimeOffsetInMinutes: -480;
        currentTimeFormat: '-08:00 Pitcairn Time - Adamstown';
      },
      {
        name: 'America/Hermosillo';
        alternativeName: 'Mexican Pacific Time';
        group: ['America/Hermosillo'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Mexico';
        countryCode: 'MX';
        mainCities: ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado'];
        rawOffsetInMinutes: -420;
        abbreviation: 'GMT-7';
        rawFormat: '-07:00 Mexican Pacific Time - Hermosillo, Ciudad Obregón, Nogales, San Luis Río Colorado';
        currentTimeOffsetInMinutes: -420;
        currentTimeFormat: '-07:00 Mexican Pacific Time - Hermosillo, Ciudad Obregón, Nogales, San Luis Río Colorado';
      },
      {
        name: 'America/Edmonton';
        alternativeName: 'Mountain Time';
        group: [
          'America/Cambridge_Bay',
          'America/Edmonton',
          'America/Inuvik',
          'America/Yellowknife',
          'Canada/Mountain'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Calgary', 'Edmonton', 'Red Deer', 'Sherwood Park'];
        rawOffsetInMinutes: -420;
        abbreviation: 'MST';
        rawFormat: '-07:00 Mountain Time - Calgary, Edmonton, Red Deer, Sherwood Park';
        currentTimeOffsetInMinutes: -420;
        currentTimeFormat: '-07:00 Mountain Time - Calgary, Edmonton, Red Deer, Sherwood Park';
      },
      {
        name: 'America/Ojinaga';
        alternativeName: 'Mountain Time';
        group: ['America/Chihuahua', 'America/Mazatlan', 'America/Ojinaga', 'Mexico/BajaSur'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Mexico';
        countryCode: 'MX';
        mainCities: ['Ciudad Juárez', 'Chihuahua', 'Culiacán', 'Mazatlán'];
        rawOffsetInMinutes: -420;
        abbreviation: 'MST';
        rawFormat: '-07:00 Mountain Time - Ciudad Juárez, Chihuahua, Culiacán, Mazatlán';
        currentTimeOffsetInMinutes: -420;
        currentTimeFormat: '-07:00 Mountain Time - Ciudad Juárez, Chihuahua, Culiacán, Mazatlán';
      },
      {
        name: 'America/Denver';
        alternativeName: 'Mountain Time';
        group: ['America/Boise', 'America/Denver', 'America/Shiprock', 'Navajo', 'US/Mountain'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['Denver', 'El Paso', 'Albuquerque', 'Colorado Springs'];
        rawOffsetInMinutes: -420;
        abbreviation: 'MST';
        rawFormat: '-07:00 Mountain Time - Denver, El Paso, Albuquerque, Colorado Springs';
        currentTimeOffsetInMinutes: -420;
        currentTimeFormat: '-07:00 Mountain Time - Denver, El Paso, Albuquerque, Colorado Springs';
      },
      {
        name: 'America/Phoenix';
        alternativeName: 'Mountain Time';
        group: ['America/Phoenix', 'US/Arizona', 'America/Creston'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler'];
        rawOffsetInMinutes: -420;
        abbreviation: 'MST';
        rawFormat: '-07:00 Mountain Time - Phoenix, Tucson, Mesa, Chandler';
        currentTimeOffsetInMinutes: -420;
        currentTimeFormat: '-07:00 Mountain Time - Phoenix, Tucson, Mesa, Chandler';
      },
      {
        name: 'America/Whitehorse';
        alternativeName: 'Yukon Time';
        group: [
          'America/Creston',
          'America/Dawson',
          'America/Dawson_Creek',
          'America/Fort_Nelson',
          'America/Whitehorse',
          'Canada/Yukon'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Whitehorse', 'Fort St. John', 'Creston', 'Dawson'];
        rawOffsetInMinutes: -420;
        abbreviation: 'YT';
        rawFormat: '-07:00 Yukon Time - Whitehorse, Fort St. John, Creston, Dawson';
        currentTimeOffsetInMinutes: -420;
        currentTimeFormat: '-07:00 Yukon Time - Whitehorse, Fort St. John, Creston, Dawson';
      },
      {
        name: 'America/Belize';
        alternativeName: 'Central Time';
        group: ['America/Belize'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Belize';
        countryCode: 'BZ';
        mainCities: ['Belize City', 'San Ignacio', 'San Pedro', 'Orange Walk'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Belize City, San Ignacio, San Pedro, Orange Walk';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Belize City, San Ignacio, San Pedro, Orange Walk';
      },
      {
        name: 'America/Chicago';
        alternativeName: 'Central Time';
        group: [
          'America/Chicago',
          'America/Indiana/Knox',
          'America/Indiana/Tell_City',
          'America/Menominee',
          'America/North_Dakota/Beulah',
          'America/North_Dakota/Center',
          'America/North_Dakota/New_Salem',
          'US/Central',
          'America/Knox_IN',
          'US/Indiana-Starke'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['Chicago', 'Houston', 'San Antonio', 'Dallas'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Chicago, Houston, San Antonio, Dallas';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Chicago, Houston, San Antonio, Dallas';
      },
      {
        name: 'America/Guatemala';
        alternativeName: 'Central Time';
        group: ['America/Guatemala'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Guatemala';
        countryCode: 'GT';
        mainCities: ['Guatemala City', 'Mixco', 'Villa Nueva', 'Cobán'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Guatemala City, Mixco, Villa Nueva, Cobán';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Guatemala City, Mixco, Villa Nueva, Cobán';
      },
      {
        name: 'America/Managua';
        alternativeName: 'Central Time';
        group: ['America/Managua'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Nicaragua';
        countryCode: 'NI';
        mainCities: ['Managua', 'León', 'Masaya', 'Chinandega'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Managua, León, Masaya, Chinandega';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Managua, León, Masaya, Chinandega';
      },
      {
        name: 'America/Mexico_City';
        alternativeName: 'Central Time';
        group: [
          'America/Bahia_Banderas',
          'America/Matamoros',
          'America/Merida',
          'America/Mexico_City',
          'America/Monterrey',
          'Mexico/General'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Mexico';
        countryCode: 'MX';
        mainCities: ['Mexico City', 'Iztapalapa', 'Puebla', 'Ecatepec de Morelos'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Mexico City, Iztapalapa, Puebla, Ecatepec de Morelos';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Mexico City, Iztapalapa, Puebla, Ecatepec de Morelos';
      },
      {
        name: 'America/Costa_Rica';
        alternativeName: 'Central Time';
        group: ['America/Costa_Rica'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Costa Rica';
        countryCode: 'CR';
        mainCities: ['San José', 'Limón', 'San Francisco', 'Alajuela'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - San José, Limón, San Francisco, Alajuela';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - San José, Limón, San Francisco, Alajuela';
      },
      {
        name: 'America/El_Salvador';
        alternativeName: 'Central Time';
        group: ['America/El_Salvador'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'El Salvador';
        countryCode: 'SV';
        mainCities: ['San Salvador', 'Soyapango', 'San Miguel', 'Santa Ana'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - San Salvador, Soyapango, San Miguel, Santa Ana';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - San Salvador, Soyapango, San Miguel, Santa Ana';
      },
      {
        name: 'America/Regina';
        alternativeName: 'Central Time';
        group: ['America/Regina', 'America/Swift_Current', 'Canada/Saskatchewan'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Saskatoon, Regina, Prince Albert, Moose Jaw';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Saskatoon, Regina, Prince Albert, Moose Jaw';
      },
      {
        name: 'America/Tegucigalpa';
        alternativeName: 'Central Time';
        group: ['America/Tegucigalpa'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Honduras';
        countryCode: 'HN';
        mainCities: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Choloma'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Tegucigalpa, San Pedro Sula, La Ceiba, Choloma';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Tegucigalpa, San Pedro Sula, La Ceiba, Choloma';
      },
      {
        name: 'America/Winnipeg';
        alternativeName: 'Central Time';
        group: [
          'America/Rainy_River',
          'America/Rankin_Inlet',
          'America/Resolute',
          'America/Winnipeg',
          'Canada/Central'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Winnipeg', 'Brandon', 'Steinbach', 'Kenora'];
        rawOffsetInMinutes: -360;
        abbreviation: 'CST';
        rawFormat: '-06:00 Central Time - Winnipeg, Brandon, Steinbach, Kenora';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Central Time - Winnipeg, Brandon, Steinbach, Kenora';
      },
      {
        name: 'Pacific/Galapagos';
        alternativeName: 'Galapagos Time';
        group: ['Pacific/Galapagos'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Ecuador';
        countryCode: 'EC';
        mainCities: ['Galapagos'];
        rawOffsetInMinutes: -360;
        abbreviation: 'GALT';
        rawFormat: '-06:00 Galapagos Time - Galapagos';
        currentTimeOffsetInMinutes: -360;
        currentTimeFormat: '-06:00 Galapagos Time - Galapagos';
      },
      {
        name: 'America/Rio_Branco';
        alternativeName: 'Acre Time';
        group: ['America/Eirunepe', 'America/Rio_Branco', 'America/Porto_Acre', 'Brazil/Acre'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Brazil';
        countryCode: 'BR';
        mainCities: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Eirunepé'];
        rawOffsetInMinutes: -300;
        abbreviation: 'ACT';
        rawFormat: '-05:00 Acre Time - Rio Branco, Cruzeiro do Sul, Sena Madureira, Eirunepé';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Acre Time - Rio Branco, Cruzeiro do Sul, Sena Madureira, Eirunepé';
      },
      {
        name: 'America/Bogota';
        alternativeName: 'Colombia Time';
        group: ['America/Bogota'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Colombia';
        countryCode: 'CO';
        mainCities: ['Bogotá', 'Cali', 'Medellín', 'Barranquilla'];
        rawOffsetInMinutes: -300;
        abbreviation: 'COT';
        rawFormat: '-05:00 Colombia Time - Bogotá, Cali, Medellín, Barranquilla';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Colombia Time - Bogotá, Cali, Medellín, Barranquilla';
      },
      {
        name: 'America/Havana';
        alternativeName: 'Cuba Time';
        group: ['America/Havana', 'Cuba'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Cuba';
        countryCode: 'CU';
        mainCities: ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín'];
        rawOffsetInMinutes: -300;
        abbreviation: 'CST';
        rawFormat: '-05:00 Cuba Time - Havana, Santiago de Cuba, Camagüey, Holguín';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Cuba Time - Havana, Santiago de Cuba, Camagüey, Holguín';
      },
      {
        name: 'Pacific/Easter';
        alternativeName: 'Easter Island Time';
        group: ['Pacific/Easter', 'Chile/EasterIsland'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Chile';
        countryCode: 'CL';
        mainCities: ['Easter'];
        rawOffsetInMinutes: -360;
        abbreviation: 'EAST';
        rawFormat: '-06:00 Easter Island Time - Easter';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Easter Island Time - Easter';
      },
      {
        name: 'America/Atikokan';
        alternativeName: 'Eastern Time';
        group: ['America/Atikokan'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Atikokan'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Atikokan';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Atikokan';
      },
      {
        name: 'America/Cancun';
        alternativeName: 'Eastern Time';
        group: ['America/Cancun'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Mexico';
        countryCode: 'MX';
        mainCities: ['Cancún', 'Chetumal', 'Playa del Carmen', 'Cozumel'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Cancún, Chetumal, Playa del Carmen, Cozumel';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Cancún, Chetumal, Playa del Carmen, Cozumel';
      },
      {
        name: 'America/Grand_Turk';
        alternativeName: 'Eastern Time';
        group: ['America/Grand_Turk'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Turks and Caicos Islands';
        countryCode: 'TC';
        mainCities: ['Cockburn Town'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Cockburn Town';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Cockburn Town';
      },
      {
        name: 'America/Cayman';
        alternativeName: 'Eastern Time';
        group: ['America/Cayman'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Cayman Islands';
        countryCode: 'KY';
        mainCities: ['George Town', 'West Bay'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - George Town, West Bay';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - George Town, West Bay';
      },
      {
        name: 'America/Jamaica';
        alternativeName: 'Eastern Time';
        group: ['America/Jamaica', 'Jamaica'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Jamaica';
        countryCode: 'JM';
        mainCities: ['Kingston', 'New Kingston', 'Spanish Town', 'Portmore'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Kingston, New Kingston, Spanish Town, Portmore';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Kingston, New Kingston, Spanish Town, Portmore';
      },
      {
        name: 'America/Nassau';
        alternativeName: 'Eastern Time';
        group: ['America/Nassau'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Bahamas';
        countryCode: 'BS';
        mainCities: ['Nassau', 'Lucaya', 'Freeport'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Nassau, Lucaya, Freeport';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Nassau, Lucaya, Freeport';
      },
      {
        name: 'America/New_York';
        alternativeName: 'Eastern Time';
        group: [
          'America/Detroit',
          'America/Indiana/Indianapolis',
          'America/Indiana/Marengo',
          'America/Indiana/Petersburg',
          'America/Indiana/Vevay',
          'America/Indiana/Vincennes',
          'America/Indiana/Winamac',
          'America/Kentucky/Louisville',
          'America/Kentucky/Monticello',
          'America/New_York',
          'US/Michigan',
          'America/Fort_Wayne',
          'America/Indianapolis',
          'US/East-Indiana',
          'America/Louisville',
          'US/Eastern'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'United States';
        countryCode: 'US';
        mainCities: ['New York City', 'Brooklyn', 'Queens', 'Philadelphia'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - New York City, Brooklyn, Queens, Philadelphia';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - New York City, Brooklyn, Queens, Philadelphia';
      },
      {
        name: 'America/Panama';
        alternativeName: 'Eastern Time';
        group: ['America/Panama', 'America/Coral_Harbour'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Panama';
        countryCode: 'PA';
        mainCities: ['Panamá', 'San Miguelito', 'Juan Díaz', 'David'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Panamá, San Miguelito, Juan Díaz, David';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Panamá, San Miguelito, Juan Díaz, David';
      },
      {
        name: 'America/Port-au-Prince';
        alternativeName: 'Eastern Time';
        group: ['America/Port-au-Prince'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Haiti';
        countryCode: 'HT';
        mainCities: ['Port-au-Prince', 'Carrefour', 'Delmas 73', 'Port-de-Paix'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Port-au-Prince, Carrefour, Delmas 73, Port-de-Paix';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Port-au-Prince, Carrefour, Delmas 73, Port-de-Paix';
      },
      {
        name: 'America/Toronto';
        alternativeName: 'Eastern Time';
        group: [
          'America/Iqaluit',
          'America/Nipigon',
          'America/Pangnirtung',
          'America/Thunder_Bay',
          'America/Toronto',
          'America/Montreal',
          'Canada/Eastern'
        ];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Toronto', 'Montréal', 'Ottawa', 'Mississauga'];
        rawOffsetInMinutes: -300;
        abbreviation: 'EST';
        rawFormat: '-05:00 Eastern Time - Toronto, Montréal, Ottawa, Mississauga';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Eastern Time - Toronto, Montréal, Ottawa, Mississauga';
      },
      {
        name: 'America/Guayaquil';
        alternativeName: 'Ecuador Time';
        group: ['America/Guayaquil'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Ecuador';
        countryCode: 'EC';
        mainCities: ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo de los Colorados'];
        rawOffsetInMinutes: -300;
        abbreviation: 'ECT';
        rawFormat: '-05:00 Ecuador Time - Quito, Guayaquil, Cuenca, Santo Domingo de los Colorados';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Ecuador Time - Quito, Guayaquil, Cuenca, Santo Domingo de los Colorados';
      },
      {
        name: 'America/Lima';
        alternativeName: 'Peru Time';
        group: ['America/Lima'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Peru';
        countryCode: 'PE';
        mainCities: ['Lima', 'Callao', 'Arequipa', 'Trujillo'];
        rawOffsetInMinutes: -300;
        abbreviation: 'PET';
        rawFormat: '-05:00 Peru Time - Lima, Callao, Arequipa, Trujillo';
        currentTimeOffsetInMinutes: -300;
        currentTimeFormat: '-05:00 Peru Time - Lima, Callao, Arequipa, Trujillo';
      },
      {
        name: 'America/Manaus';
        alternativeName: 'Amazon Time';
        group: [
          'America/Boa_Vista',
          'America/Campo_Grande',
          'America/Cuiaba',
          'America/Manaus',
          'America/Porto_Velho',
          'Brazil/West'
        ];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Brazil';
        countryCode: 'BR';
        mainCities: ['Manaus', 'Campo Grande', 'Cuiabá', 'Porto Velho'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AMT';
        rawFormat: '-04:00 Amazon Time - Manaus, Campo Grande, Cuiabá, Porto Velho';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Amazon Time - Manaus, Campo Grande, Cuiabá, Porto Velho';
      },
      {
        name: 'America/St_Kitts';
        alternativeName: 'Atlantic Time';
        group: ['America/St_Kitts'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Saint Kitts and Nevis';
        countryCode: 'KN';
        mainCities: ['Basseterre'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Basseterre';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Basseterre';
      },
      {
        name: 'America/Blanc-Sablon';
        alternativeName: 'Atlantic Time';
        group: ['America/Blanc-Sablon'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Blanc-Sablon'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Blanc-Sablon';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Blanc-Sablon';
      },
      {
        name: 'America/Montserrat';
        alternativeName: 'Atlantic Time';
        group: ['America/Montserrat'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Montserrat';
        countryCode: 'MS';
        mainCities: ['Brades', 'Plymouth'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Brades, Plymouth';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Brades, Plymouth';
      },
      {
        name: 'America/Barbados';
        alternativeName: 'Atlantic Time';
        group: ['America/Barbados'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Barbados';
        countryCode: 'BB';
        mainCities: ['Bridgetown'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Bridgetown';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Bridgetown';
      },
      {
        name: 'America/St_Lucia';
        alternativeName: 'Atlantic Time';
        group: ['America/St_Lucia'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Saint Lucia';
        countryCode: 'LC';
        mainCities: ['Castries'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Castries';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Castries';
      },
      {
        name: 'America/Port_of_Spain';
        alternativeName: 'Atlantic Time';
        group: ['America/Port_of_Spain'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Trinidad and Tobago';
        countryCode: 'TT';
        mainCities: ['Chaguanas', 'Mon Repos', 'San Fernando', 'Port of Spain'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Chaguanas, Mon Repos, San Fernando, Port of Spain';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Chaguanas, Mon Repos, San Fernando, Port of Spain';
      },
      {
        name: 'America/Martinique';
        alternativeName: 'Atlantic Time';
        group: ['America/Martinique'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Martinique';
        countryCode: 'MQ';
        mainCities: ['Fort-de-France', 'Le Lamentin', 'Le Robert', 'Sainte-Marie'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Fort-de-France, Le Lamentin, Le Robert, Sainte-Marie';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Fort-de-France, Le Lamentin, Le Robert, Sainte-Marie';
      },
      {
        name: 'America/St_Barthelemy';
        alternativeName: 'Atlantic Time';
        group: ['America/St_Barthelemy'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Saint Barthelemy';
        countryCode: 'BL';
        mainCities: ['Gustavia'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Gustavia';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Gustavia';
      },
      {
        name: 'America/Halifax';
        alternativeName: 'Atlantic Time';
        group: ['America/Glace_Bay', 'America/Goose_Bay', 'America/Halifax', 'America/Moncton', 'Canada/Atlantic'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ['Halifax', 'Moncton', 'Sydney', 'Dartmouth'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Halifax, Moncton, Sydney, Dartmouth';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Halifax, Moncton, Sydney, Dartmouth';
      },
      {
        name: 'Atlantic/Bermuda';
        alternativeName: 'Atlantic Time';
        group: ['Atlantic/Bermuda'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Bermuda';
        countryCode: 'BM';
        mainCities: ['Hamilton'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Hamilton';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Hamilton';
      },
      {
        name: 'America/St_Vincent';
        alternativeName: 'Atlantic Time';
        group: ['America/St_Vincent'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Saint Vincent and the Grenadines';
        countryCode: 'VC';
        mainCities: ['Kingstown', 'Kingstown Park'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Kingstown, Kingstown Park';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Kingstown, Kingstown Park';
      },
      {
        name: 'America/Kralendijk';
        alternativeName: 'Atlantic Time';
        group: ['America/Kralendijk'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Bonaire, Saint Eustatius and Saba ';
        countryCode: 'BQ';
        mainCities: ['Kralendijk'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Kralendijk';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Kralendijk';
      },
      {
        name: 'America/Guadeloupe';
        alternativeName: 'Atlantic Time';
        group: ['America/Guadeloupe'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Guadeloupe';
        countryCode: 'GP';
        mainCities: ['Les Abymes', 'Baie-Mahault', 'Le Gosier', 'Petit-Bourg'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Les Abymes, Baie-Mahault, Le Gosier, Petit-Bourg';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Les Abymes, Baie-Mahault, Le Gosier, Petit-Bourg';
      },
      {
        name: 'America/Marigot';
        alternativeName: 'Atlantic Time';
        group: ['America/Marigot'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Saint Martin';
        countryCode: 'MF';
        mainCities: ['Marigot'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Marigot';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Marigot';
      },
      {
        name: 'America/Aruba';
        alternativeName: 'Atlantic Time';
        group: ['America/Aruba'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Aruba';
        countryCode: 'AW';
        mainCities: ['Oranjestad', 'Tanki Leendert', 'San Nicolas'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Oranjestad, Tanki Leendert, San Nicolas';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Oranjestad, Tanki Leendert, San Nicolas';
      },
      {
        name: 'America/Lower_Princes';
        alternativeName: 'Atlantic Time';
        group: ['America/Lower_Princes'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Sint Maarten';
        countryCode: 'SX';
        mainCities: ['Philipsburg'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Philipsburg';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Philipsburg';
      },
      {
        name: 'America/Tortola';
        alternativeName: 'Atlantic Time';
        group: ['America/Tortola'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'British Virgin Islands';
        countryCode: 'VG';
        mainCities: ['Road Town'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Road Town';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Road Town';
      },
      {
        name: 'America/Dominica';
        alternativeName: 'Atlantic Time';
        group: ['America/Dominica'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Dominica';
        countryCode: 'DM';
        mainCities: ['Roseau'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Roseau';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Roseau';
      },
      {
        name: 'America/St_Thomas';
        alternativeName: 'Atlantic Time';
        group: ['America/St_Thomas'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'U.S. Virgin Islands';
        countryCode: 'VI';
        mainCities: ['Saint Croix', 'Charlotte Amalie'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Saint Croix, Charlotte Amalie';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Saint Croix, Charlotte Amalie';
      },
      {
        name: 'America/Grenada';
        alternativeName: 'Atlantic Time';
        group: ['America/Grenada'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Grenada';
        countryCode: 'GD';
        mainCities: ["Saint George's"];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: "-04:00 Atlantic Time - Saint George's";
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: "-04:00 Atlantic Time - Saint George's";
      },
      {
        name: 'America/Antigua';
        alternativeName: 'Atlantic Time';
        group: ['America/Antigua'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Antigua and Barbuda';
        countryCode: 'AG';
        mainCities: ['Saint John’s'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Saint John’s';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Saint John’s';
      },
      {
        name: 'America/Puerto_Rico';
        alternativeName: 'Atlantic Time';
        group: ['America/Puerto_Rico', 'America/Virgin'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Puerto Rico';
        countryCode: 'PR';
        mainCities: ['San Juan', 'Bayamón', 'Carolina', 'Ponce'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - San Juan, Bayamón, Carolina, Ponce';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - San Juan, Bayamón, Carolina, Ponce';
      },
      {
        name: 'America/Santo_Domingo';
        alternativeName: 'Atlantic Time';
        group: ['America/Santo_Domingo'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Dominican Republic';
        countryCode: 'DO';
        mainCities: ['Santo Domingo', 'Santiago de los Caballeros', 'Santo Domingo Oeste', 'Santo Domingo Este'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Santo Domingo, Santiago de los Caballeros, Santo Domingo Oeste, Santo Domingo Este';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Santo Domingo, Santiago de los Caballeros, Santo Domingo Oeste, Santo Domingo Este';
      },
      {
        name: 'America/Anguilla';
        alternativeName: 'Atlantic Time';
        group: ['America/Anguilla'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Anguilla';
        countryCode: 'AI';
        mainCities: ['The Valley'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - The Valley';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - The Valley';
      },
      {
        name: 'America/Thule';
        alternativeName: 'Atlantic Time';
        group: ['America/Thule'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Greenland';
        countryCode: 'GL';
        mainCities: ['Thule'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Thule';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Thule';
      },
      {
        name: 'America/Curacao';
        alternativeName: 'Atlantic Time';
        group: ['America/Curacao'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Curacao';
        countryCode: 'CW';
        mainCities: ['Willemstad'];
        rawOffsetInMinutes: -240;
        abbreviation: 'AST';
        rawFormat: '-04:00 Atlantic Time - Willemstad';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Atlantic Time - Willemstad';
      },
      {
        name: 'America/La_Paz';
        alternativeName: 'Bolivia Time';
        group: ['America/La_Paz'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Bolivia';
        countryCode: 'BO';
        mainCities: ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'Sucre'];
        rawOffsetInMinutes: -240;
        abbreviation: 'BOT';
        rawFormat: '-04:00 Bolivia Time - La Paz, Santa Cruz de la Sierra, Cochabamba, Sucre';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Bolivia Time - La Paz, Santa Cruz de la Sierra, Cochabamba, Sucre';
      },
      {
        name: 'America/Guyana';
        alternativeName: 'Guyana Time';
        group: ['America/Guyana'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Guyana';
        countryCode: 'GY';
        mainCities: ['Georgetown', 'Linden', 'New Amsterdam'];
        rawOffsetInMinutes: -240;
        abbreviation: 'GYT';
        rawFormat: '-04:00 Guyana Time - Georgetown, Linden, New Amsterdam';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Guyana Time - Georgetown, Linden, New Amsterdam';
      },
      {
        name: 'America/Caracas';
        alternativeName: 'Venezuela Time';
        group: ['America/Caracas'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Venezuela';
        countryCode: 'VE';
        mainCities: ['Caracas', 'Maracaibo', 'Maracay', 'Valencia'];
        rawOffsetInMinutes: -240;
        abbreviation: 'VET';
        rawFormat: '-04:00 Venezuela Time - Caracas, Maracaibo, Maracay, Valencia';
        currentTimeOffsetInMinutes: -240;
        currentTimeFormat: '-04:00 Venezuela Time - Caracas, Maracaibo, Maracay, Valencia';
      },
      {
        name: 'America/St_Johns';
        alternativeName: 'Newfoundland Time';
        group: ['America/St_Johns', 'Canada/Newfoundland'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Canada';
        countryCode: 'CA';
        mainCities: ["St. John's", 'Mount Pearl', 'Corner Brook', 'Conception Bay South'];
        rawOffsetInMinutes: -210;
        abbreviation: 'NST';
        rawFormat: "-03:30 Newfoundland Time - St. John's, Mount Pearl, Corner Brook, Conception Bay South";
        currentTimeOffsetInMinutes: -210;
        currentTimeFormat: "-03:30 Newfoundland Time - St. John's, Mount Pearl, Corner Brook, Conception Bay South";
      },
      {
        name: 'America/Argentina/Buenos_Aires';
        alternativeName: 'Argentina Time';
        group: [
          'America/Argentina/Buenos_Aires',
          'America/Argentina/Catamarca',
          'America/Argentina/Cordoba',
          'America/Argentina/Jujuy',
          'America/Argentina/La_Rioja',
          'America/Argentina/Mendoza',
          'America/Argentina/Rio_Gallegos',
          'America/Argentina/Salta',
          'America/Argentina/San_Juan',
          'America/Argentina/San_Luis',
          'America/Argentina/Tucuman',
          'America/Argentina/Ushuaia',
          'America/Buenos_Aires',
          'America/Argentina/ComodRivadavia',
          'America/Catamarca',
          'America/Cordoba',
          'America/Rosario',
          'America/Jujuy',
          'America/Mendoza'
        ];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Argentina';
        countryCode: 'AR';
        mainCities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'];
        rawOffsetInMinutes: -180;
        abbreviation: 'ART';
        rawFormat: '-03:00 Argentina Time - Buenos Aires, Córdoba, Rosario, Mendoza';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Argentina Time - Buenos Aires, Córdoba, Rosario, Mendoza';
      },
      {
        name: 'America/Sao_Paulo';
        alternativeName: 'Brasilia Time';
        group: [
          'America/Araguaina',
          'America/Bahia',
          'America/Belem',
          'America/Fortaleza',
          'America/Maceio',
          'America/Recife',
          'America/Santarem',
          'America/Sao_Paulo',
          'Brazil/East'
        ];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Brazil';
        countryCode: 'BR';
        mainCities: ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza'];
        rawOffsetInMinutes: -180;
        abbreviation: 'BRT';
        rawFormat: '-03:00 Brasilia Time - São Paulo, Rio de Janeiro, Salvador, Fortaleza';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Brasilia Time - São Paulo, Rio de Janeiro, Salvador, Fortaleza';
      },
      {
        name: 'Antarctica/Palmer';
        alternativeName: 'Chile Time';
        group: ['Antarctica/Palmer', 'Antarctica/Rothera'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['Palmer', 'Rothera'];
        rawOffsetInMinutes: -180;
        abbreviation: 'CLT';
        rawFormat: '-03:00 Chile Time - Palmer, Rothera';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Chile Time - Palmer, Rothera';
      },
      {
        name: 'America/Punta_Arenas';
        alternativeName: 'Chile Time';
        group: ['America/Punta_Arenas'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Chile';
        countryCode: 'CL';
        mainCities: ['Punta Arenas', 'Puerto Natales'];
        rawOffsetInMinutes: -180;
        abbreviation: 'CLT';
        rawFormat: '-03:00 Chile Time - Punta Arenas, Puerto Natales';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Chile Time - Punta Arenas, Puerto Natales';
      },
      {
        name: 'America/Santiago';
        alternativeName: 'Chile Time';
        group: ['America/Santiago', 'Chile/Continental'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Chile';
        countryCode: 'CL';
        mainCities: ['Santiago', 'Puente Alto', 'Antofagasta', 'Viña del Mar'];
        rawOffsetInMinutes: -240;
        abbreviation: 'CLT';
        rawFormat: '-04:00 Chile Time - Santiago, Puente Alto, Antofagasta, Viña del Mar';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Chile Time - Santiago, Puente Alto, Antofagasta, Viña del Mar';
      },
      {
        name: 'Atlantic/Stanley';
        alternativeName: 'Falkland Islands Time';
        group: ['Atlantic/Stanley'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Falkland Islands';
        countryCode: 'FK';
        mainCities: ['Stanley'];
        rawOffsetInMinutes: -180;
        abbreviation: 'FKST';
        rawFormat: '-03:00 Falkland Islands Time - Stanley';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Falkland Islands Time - Stanley';
      },
      {
        name: 'America/Cayenne';
        alternativeName: 'French Guiana Time';
        group: ['America/Cayenne'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'French Guiana';
        countryCode: 'GF';
        mainCities: ['Cayenne', 'Matoury', 'Saint-Laurent-du-Maroni', 'Kourou'];
        rawOffsetInMinutes: -180;
        abbreviation: 'GFT';
        rawFormat: '-03:00 French Guiana Time - Cayenne, Matoury, Saint-Laurent-du-Maroni, Kourou';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 French Guiana Time - Cayenne, Matoury, Saint-Laurent-du-Maroni, Kourou';
      },
      {
        name: 'America/Asuncion';
        alternativeName: 'Paraguay Time';
        group: ['America/Asuncion'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Paraguay';
        countryCode: 'PY';
        mainCities: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Capiatá'];
        rawOffsetInMinutes: -240;
        abbreviation: 'PYT';
        rawFormat: '-04:00 Paraguay Time - Asunción, Ciudad del Este, San Lorenzo, Capiatá';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Paraguay Time - Asunción, Ciudad del Este, San Lorenzo, Capiatá';
      },
      {
        name: 'America/Miquelon';
        alternativeName: 'St. Pierre & Miquelon Time';
        group: ['America/Miquelon'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Saint Pierre and Miquelon';
        countryCode: 'PM';
        mainCities: ['Saint-Pierre'];
        rawOffsetInMinutes: -180;
        abbreviation: 'PM';
        rawFormat: '-03:00 St. Pierre & Miquelon Time - Saint-Pierre';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 St. Pierre & Miquelon Time - Saint-Pierre';
      },
      {
        name: 'America/Paramaribo';
        alternativeName: 'Suriname Time';
        group: ['America/Paramaribo'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Suriname';
        countryCode: 'SR';
        mainCities: ['Paramaribo', 'Lelydorp'];
        rawOffsetInMinutes: -180;
        abbreviation: 'SRT';
        rawFormat: '-03:00 Suriname Time - Paramaribo, Lelydorp';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Suriname Time - Paramaribo, Lelydorp';
      },
      {
        name: 'America/Montevideo';
        alternativeName: 'Uruguay Time';
        group: ['America/Montevideo'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Uruguay';
        countryCode: 'UY';
        mainCities: ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras'];
        rawOffsetInMinutes: -180;
        abbreviation: 'UYT';
        rawFormat: '-03:00 Uruguay Time - Montevideo, Salto, Paysandú, Las Piedras';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 Uruguay Time - Montevideo, Salto, Paysandú, Las Piedras';
      },
      {
        name: 'America/Nuuk';
        alternativeName: 'West Greenland Time';
        group: ['America/Nuuk', 'America/Godthab'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Greenland';
        countryCode: 'GL';
        mainCities: ['Nuuk'];
        rawOffsetInMinutes: -180;
        abbreviation: 'WGT';
        rawFormat: '-03:00 West Greenland Time - Nuuk';
        currentTimeOffsetInMinutes: -180;
        currentTimeFormat: '-03:00 West Greenland Time - Nuuk';
      },
      {
        name: 'America/Noronha';
        alternativeName: 'Fernando de Noronha Time';
        group: ['America/Noronha', 'Brazil/DeNoronha'];
        continentCode: 'SA';
        continentName: 'South America';
        countryName: 'Brazil';
        countryCode: 'BR';
        mainCities: ['Noronha'];
        rawOffsetInMinutes: -120;
        abbreviation: 'FNT';
        rawFormat: '-02:00 Fernando de Noronha Time - Noronha';
        currentTimeOffsetInMinutes: -120;
        currentTimeFormat: '-02:00 Fernando de Noronha Time - Noronha';
      },
      {
        name: 'Atlantic/South_Georgia';
        alternativeName: 'South Georgia Time';
        group: ['Atlantic/South_Georgia'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'South Georgia and the South Sandwich Islands';
        countryCode: 'GS';
        mainCities: ['Grytviken'];
        rawOffsetInMinutes: -120;
        abbreviation: 'GST';
        rawFormat: '-02:00 South Georgia Time - Grytviken';
        currentTimeOffsetInMinutes: -120;
        currentTimeFormat: '-02:00 South Georgia Time - Grytviken';
      },
      {
        name: 'Atlantic/Azores';
        alternativeName: 'Azores Time';
        group: ['Atlantic/Azores'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Portugal';
        countryCode: 'PT';
        mainCities: ['Ponta Delgada'];
        rawOffsetInMinutes: -60;
        abbreviation: 'AZOT';
        rawFormat: '-01:00 Azores Time - Ponta Delgada';
        currentTimeOffsetInMinutes: -60;
        currentTimeFormat: '-01:00 Azores Time - Ponta Delgada';
      },
      {
        name: 'Atlantic/Cape_Verde';
        alternativeName: 'Cape Verde Time';
        group: ['Atlantic/Cape_Verde'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Cabo Verde';
        countryCode: 'CV';
        mainCities: ['Praia', 'Mindelo', 'Santa Maria', 'Cova Figueira'];
        rawOffsetInMinutes: -60;
        abbreviation: 'CVT';
        rawFormat: '-01:00 Cape Verde Time - Praia, Mindelo, Santa Maria, Cova Figueira';
        currentTimeOffsetInMinutes: -60;
        currentTimeFormat: '-01:00 Cape Verde Time - Praia, Mindelo, Santa Maria, Cova Figueira';
      },
      {
        name: 'America/Scoresbysund';
        alternativeName: 'East Greenland Time';
        group: ['America/Scoresbysund'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Greenland';
        countryCode: 'GL';
        mainCities: ['Scoresbysund'];
        rawOffsetInMinutes: -60;
        abbreviation: 'EGT';
        rawFormat: '-01:00 East Greenland Time - Scoresbysund';
        currentTimeOffsetInMinutes: -60;
        currentTimeFormat: '-01:00 East Greenland Time - Scoresbysund';
      },
      {
        name: 'Africa/Abidjan';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Abidjan', 'Africa/Timbuktu', 'Iceland'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Ivory Coast';
        countryCode: 'CI';
        mainCities: ['Abidjan', 'Abobo', 'Bouaké', 'Daloa'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Abidjan, Abobo, Bouaké, Daloa';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Abidjan, Abobo, Bouaké, Daloa';
      },
      {
        name: 'Africa/Accra';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Accra'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Ghana';
        countryCode: 'GH';
        mainCities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Accra, Kumasi, Tamale, Takoradi';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Accra, Kumasi, Tamale, Takoradi';
      },
      {
        name: 'Africa/Bamako';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Bamako'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Mali';
        countryCode: 'ML';
        mainCities: ['Bamako', 'Ségou', 'Sikasso', 'Mopti'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Bamako, Ségou, Sikasso, Mopti';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Bamako, Ségou, Sikasso, Mopti';
      },
      {
        name: 'Africa/Bissau';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Bissau'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Guinea-Bissau';
        countryCode: 'GW';
        mainCities: ['Bissau', 'Bafatá'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Bissau, Bafatá';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Bissau, Bafatá';
      },
      {
        name: 'Africa/Conakry';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Conakry'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Guinea';
        countryCode: 'GN';
        mainCities: ['Camayenne', 'Conakry', 'Nzérékoré', 'Kindia'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Camayenne, Conakry, Nzérékoré, Kindia';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Camayenne, Conakry, Nzérékoré, Kindia';
      },
      {
        name: 'Africa/Dakar';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Dakar'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Senegal';
        countryCode: 'SN';
        mainCities: ['Dakar', 'Pikine', 'Touba', 'Thiès'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Dakar, Pikine, Touba, Thiès';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Dakar, Pikine, Touba, Thiès';
      },
      {
        name: 'America/Danmarkshavn';
        alternativeName: 'Greenwich Mean Time';
        group: ['America/Danmarkshavn'];
        continentCode: 'NA';
        continentName: 'North America';
        countryName: 'Greenland';
        countryCode: 'GL';
        mainCities: ['Danmarkshavn'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Danmarkshavn';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Danmarkshavn';
      },
      {
        name: 'Europe/Isle_of_Man';
        alternativeName: 'Greenwich Mean Time';
        group: ['Europe/Isle_of_Man'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Isle of Man';
        countryCode: 'IM';
        mainCities: ['Douglas'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Douglas';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Douglas';
      },
      {
        name: 'Europe/Dublin';
        alternativeName: 'Greenwich Mean Time';
        group: ['Europe/Dublin', 'Eire'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Ireland';
        countryCode: 'IE';
        mainCities: ['Dublin', 'South Dublin', 'Cork', 'Luimneach'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Dublin, South Dublin, Cork, Luimneach';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Dublin, South Dublin, Cork, Luimneach';
      },
      {
        name: 'Africa/Freetown';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Freetown'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Sierra Leone';
        countryCode: 'SL';
        mainCities: ['Freetown', 'Bo', 'Kenema', 'Koidu'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Freetown, Bo, Kenema, Koidu';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Freetown, Bo, Kenema, Koidu';
      },
      {
        name: 'Atlantic/St_Helena';
        alternativeName: 'Greenwich Mean Time';
        group: ['Atlantic/St_Helena'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Saint Helena';
        countryCode: 'SH';
        mainCities: ['Jamestown'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Jamestown';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Jamestown';
      },
      {
        name: 'Africa/Lome';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Lome'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Togo';
        countryCode: 'TG';
        mainCities: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Lomé, Sokodé, Kara, Atakpamé';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Lomé, Sokodé, Kara, Atakpamé';
      },
      {
        name: 'Europe/London';
        alternativeName: 'Greenwich Mean Time';
        group: ['Europe/London', 'Europe/Belfast', 'GB', 'GB-Eire'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'United Kingdom';
        countryCode: 'GB';
        mainCities: ['London', 'Birmingham', 'Liverpool', 'Sheffield'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - London, Birmingham, Liverpool, Sheffield';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - London, Birmingham, Liverpool, Sheffield';
      },
      {
        name: 'Africa/Monrovia';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Monrovia'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Liberia';
        countryCode: 'LR';
        mainCities: ['Monrovia', 'Gbarnga', 'Kakata', 'Bensonville'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Monrovia, Gbarnga, Kakata, Bensonville';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Monrovia, Gbarnga, Kakata, Bensonville';
      },
      {
        name: 'Africa/Nouakchott';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Nouakchott'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Mauritania';
        countryCode: 'MR';
        mainCities: ['Nouakchott', 'Nouadhibou', 'Néma', 'Kaédi'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Nouakchott, Nouadhibou, Néma, Kaédi';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Nouakchott, Nouadhibou, Néma, Kaédi';
      },
      {
        name: 'Africa/Ouagadougou';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Ouagadougou'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Burkina Faso';
        countryCode: 'BF';
        mainCities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Ouagadougou, Bobo-Dioulasso, Koudougou, Ouahigouya';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Ouagadougou, Bobo-Dioulasso, Koudougou, Ouahigouya';
      },
      {
        name: 'Atlantic/Reykjavik';
        alternativeName: 'Greenwich Mean Time';
        group: ['Atlantic/Reykjavik', 'Iceland'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Iceland';
        countryCode: 'IS';
        mainCities: ['Reykjavík', 'Kópavogur', 'Hafnarfjörður', 'Akureyri'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Reykjavík, Kópavogur, Hafnarfjörður, Akureyri';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Reykjavík, Kópavogur, Hafnarfjörður, Akureyri';
      },
      {
        name: 'Europe/Jersey';
        alternativeName: 'Greenwich Mean Time';
        group: ['Europe/Jersey'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Jersey';
        countryCode: 'JE';
        mainCities: ['Saint Helier'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Saint Helier';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Saint Helier';
      },
      {
        name: 'Europe/Guernsey';
        alternativeName: 'Greenwich Mean Time';
        group: ['Europe/Guernsey'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Guernsey';
        countryCode: 'GG';
        mainCities: ['Saint Peter Port'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Saint Peter Port';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Saint Peter Port';
      },
      {
        name: 'Africa/Sao_Tome';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Sao_Tome'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Sao Tome and Principe';
        countryCode: 'ST';
        mainCities: ['São Tomé'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - São Tomé';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - São Tomé';
      },
      {
        name: 'Africa/Banjul';
        alternativeName: 'Greenwich Mean Time';
        group: ['Africa/Banjul'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Gambia';
        countryCode: 'GM';
        mainCities: ['Serekunda', 'Brikama', 'Bakau', 'Banjul'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Serekunda, Brikama, Bakau, Banjul';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Serekunda, Brikama, Bakau, Banjul';
      },
      {
        name: 'Antarctica/Troll';
        alternativeName: 'Greenwich Mean Time';
        group: ['Antarctica/Troll'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['Troll'];
        rawOffsetInMinutes: 0;
        abbreviation: 'GMT';
        rawFormat: '+00:00 Greenwich Mean Time - Troll';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Greenwich Mean Time - Troll';
      },
      {
        name: 'Atlantic/Canary';
        alternativeName: 'Western European Time';
        group: ['Atlantic/Canary'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Spain';
        countryCode: 'ES';
        mainCities: ['Las Palmas de Gran Canaria', 'Santa Cruz de Tenerife', 'La Laguna', 'Telde'];
        rawOffsetInMinutes: 0;
        abbreviation: 'WET';
        rawFormat: '+00:00 Western European Time - Las Palmas de Gran Canaria, Santa Cruz de Tenerife, La Laguna, Telde';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Western European Time - Las Palmas de Gran Canaria, Santa Cruz de Tenerife, La Laguna, Telde';
      },
      {
        name: 'Europe/Lisbon';
        alternativeName: 'Western European Time';
        group: ['Atlantic/Madeira', 'Europe/Lisbon', 'Portugal'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Portugal';
        countryCode: 'PT';
        mainCities: ['Lisbon', 'Porto', 'Amadora', 'Braga'];
        rawOffsetInMinutes: 0;
        abbreviation: 'WET';
        rawFormat: '+00:00 Western European Time - Lisbon, Porto, Amadora, Braga';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Western European Time - Lisbon, Porto, Amadora, Braga';
      },
      {
        name: 'Atlantic/Faroe';
        alternativeName: 'Western European Time';
        group: ['Atlantic/Faroe', 'Atlantic/Faeroe'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Faroe Islands';
        countryCode: 'FO';
        mainCities: ['Tórshavn'];
        rawOffsetInMinutes: 0;
        abbreviation: 'WET';
        rawFormat: '+00:00 Western European Time - Tórshavn';
        currentTimeOffsetInMinutes: 0;
        currentTimeFormat: '+00:00 Western European Time - Tórshavn';
      },
      {
        name: 'Africa/Algiers';
        alternativeName: 'Central European Time';
        group: ['Africa/Algiers'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Algeria';
        countryCode: 'DZ';
        mainCities: ['Algiers', 'Boumerdas', 'Oran', 'Tébessa'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Algiers, Boumerdas, Oran, Tébessa';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Algiers, Boumerdas, Oran, Tébessa';
      },
      {
        name: 'Europe/Amsterdam';
        alternativeName: 'Central European Time';
        group: ['Europe/Amsterdam'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Netherlands';
        countryCode: 'NL';
        mainCities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Amsterdam, Rotterdam, The Hague, Utrecht';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Amsterdam, Rotterdam, The Hague, Utrecht';
      },
      {
        name: 'Europe/Andorra';
        alternativeName: 'Central European Time';
        group: ['Europe/Andorra'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Andorra';
        countryCode: 'AD';
        mainCities: ['Andorra la Vella', 'les Escaldes'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Andorra la Vella, les Escaldes';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Andorra la Vella, les Escaldes';
      },
      {
        name: 'Europe/Belgrade';
        alternativeName: 'Central European Time';
        group: ['Europe/Belgrade'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Serbia';
        countryCode: 'RS';
        mainCities: ['Belgrade', 'Niš', 'Novi Sad', 'Zemun'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Belgrade, Niš, Novi Sad, Zemun';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Belgrade, Niš, Novi Sad, Zemun';
      },
      {
        name: 'Europe/Berlin';
        alternativeName: 'Central European Time';
        group: ['Europe/Berlin', 'Europe/Busingen', 'Atlantic/Jan_Mayen'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Germany';
        countryCode: 'DE';
        mainCities: ['Berlin', 'Hamburg', 'Munich', 'Köln'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Berlin, Hamburg, Munich, Köln';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Berlin, Hamburg, Munich, Köln';
      },
      {
        name: 'Europe/Malta';
        alternativeName: 'Central European Time';
        group: ['Europe/Malta'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Malta';
        countryCode: 'MT';
        mainCities: ['Birkirkara', 'Qormi', 'Mosta', 'Żabbar'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Birkirkara, Qormi, Mosta, Żabbar';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Birkirkara, Qormi, Mosta, Żabbar';
      },
      {
        name: 'Europe/Bratislava';
        alternativeName: 'Central European Time';
        group: ['Europe/Bratislava'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Slovakia';
        countryCode: 'SK';
        mainCities: ['Bratislava', 'Košice', 'Nitra', 'Prešov'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Bratislava, Košice, Nitra, Prešov';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Bratislava, Košice, Nitra, Prešov';
      },
      {
        name: 'Europe/Brussels';
        alternativeName: 'Central European Time';
        group: ['Europe/Brussels'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Belgium';
        countryCode: 'BE';
        mainCities: ['Brussels', 'Antwerpen', 'Gent', 'Charleroi'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Brussels, Antwerpen, Gent, Charleroi';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Brussels, Antwerpen, Gent, Charleroi';
      },
      {
        name: 'Europe/Budapest';
        alternativeName: 'Central European Time';
        group: ['Europe/Budapest'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Hungary';
        countryCode: 'HU';
        mainCities: ['Budapest', 'Debrecen', 'Szeged', 'Pécs'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Budapest, Debrecen, Szeged, Pécs';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Budapest, Debrecen, Szeged, Pécs';
      },
      {
        name: 'Europe/Copenhagen';
        alternativeName: 'Central European Time';
        group: ['Europe/Copenhagen'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Denmark';
        countryCode: 'DK';
        mainCities: ['Copenhagen', 'Århus', 'Odense', 'Aalborg'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Copenhagen, Århus, Odense, Aalborg';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Copenhagen, Århus, Odense, Aalborg';
      },
      {
        name: 'Europe/Gibraltar';
        alternativeName: 'Central European Time';
        group: ['Europe/Gibraltar'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Gibraltar';
        countryCode: 'GI';
        mainCities: ['Gibraltar'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Gibraltar';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Gibraltar';
      },
      {
        name: 'Europe/Ljubljana';
        alternativeName: 'Central European Time';
        group: ['Europe/Ljubljana'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Slovenia';
        countryCode: 'SI';
        mainCities: ['Ljubljana', 'Maribor', 'Kranj', 'Celje'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Ljubljana, Maribor, Kranj, Celje';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Ljubljana, Maribor, Kranj, Celje';
      },
      {
        name: 'Arctic/Longyearbyen';
        alternativeName: 'Central European Time';
        group: ['Arctic/Longyearbyen'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Svalbard and Jan Mayen';
        countryCode: 'SJ';
        mainCities: ['Longyearbyen'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Longyearbyen';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Longyearbyen';
      },
      {
        name: 'Europe/Luxembourg';
        alternativeName: 'Central European Time';
        group: ['Europe/Luxembourg'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Luxembourg';
        countryCode: 'LU';
        mainCities: ['Luxembourg', 'Esch-sur-Alzette', 'Dudelange'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Luxembourg, Esch-sur-Alzette, Dudelange';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Luxembourg, Esch-sur-Alzette, Dudelange';
      },
      {
        name: 'Europe/Madrid';
        alternativeName: 'Central European Time';
        group: ['Africa/Ceuta', 'Europe/Madrid'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Spain';
        countryCode: 'ES';
        mainCities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Madrid, Barcelona, Valencia, Sevilla';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Madrid, Barcelona, Valencia, Sevilla';
      },
      {
        name: 'Europe/Monaco';
        alternativeName: 'Central European Time';
        group: ['Europe/Monaco'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Monaco';
        countryCode: 'MC';
        mainCities: ['Monaco', 'Monte-Carlo'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Monaco, Monte-Carlo';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Monaco, Monte-Carlo';
      },
      {
        name: 'Europe/Oslo';
        alternativeName: 'Central European Time';
        group: ['Europe/Oslo', 'Atlantic/Jan_Mayen'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Norway';
        countryCode: 'NO';
        mainCities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Oslo, Bergen, Trondheim, Stavanger';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Oslo, Bergen, Trondheim, Stavanger';
      },
      {
        name: 'Europe/Paris';
        alternativeName: 'Central European Time';
        group: ['Europe/Paris'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'France';
        countryCode: 'FR';
        mainCities: ['Paris', 'Marseille', 'Toulouse', 'Lyon'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Paris, Marseille, Toulouse, Lyon';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Paris, Marseille, Toulouse, Lyon';
      },
      {
        name: 'Europe/Podgorica';
        alternativeName: 'Central European Time';
        group: ['Europe/Podgorica'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Montenegro';
        countryCode: 'ME';
        mainCities: ['Podgorica', 'Nikšić', 'Herceg Novi', 'Pljevlja'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Podgorica, Nikšić, Herceg Novi, Pljevlja';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Podgorica, Nikšić, Herceg Novi, Pljevlja';
      },
      {
        name: 'Europe/Prague';
        alternativeName: 'Central European Time';
        group: ['Europe/Prague'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Czechia';
        countryCode: 'CZ';
        mainCities: ['Prague', 'Brno', 'Ostrava', 'Pilsen'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Prague, Brno, Ostrava, Pilsen';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Prague, Brno, Ostrava, Pilsen';
      },
      {
        name: 'Europe/Rome';
        alternativeName: 'Central European Time';
        group: ['Europe/Rome'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Italy';
        countryCode: 'IT';
        mainCities: ['Rome', 'Milan', 'Naples', 'Turin'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Rome, Milan, Naples, Turin';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Rome, Milan, Naples, Turin';
      },
      {
        name: 'Europe/San_Marino';
        alternativeName: 'Central European Time';
        group: ['Europe/San_Marino'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'San Marino';
        countryCode: 'SM';
        mainCities: ['San Marino'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - San Marino';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - San Marino';
      },
      {
        name: 'Europe/Sarajevo';
        alternativeName: 'Central European Time';
        group: ['Europe/Sarajevo'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Bosnia and Herzegovina';
        countryCode: 'BA';
        mainCities: ['Sarajevo', 'Banja Luka', 'Zenica', 'Tuzla'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Sarajevo, Banja Luka, Zenica, Tuzla';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Sarajevo, Banja Luka, Zenica, Tuzla';
      },
      {
        name: 'Europe/Skopje';
        alternativeName: 'Central European Time';
        group: ['Europe/Skopje'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'North Macedonia';
        countryCode: 'MK';
        mainCities: ['Skopje', 'Bitola', 'Kumanovo', 'Prilep'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Skopje, Bitola, Kumanovo, Prilep';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Skopje, Bitola, Kumanovo, Prilep';
      },
      {
        name: 'Europe/Stockholm';
        alternativeName: 'Central European Time';
        group: ['Europe/Stockholm'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Sweden';
        countryCode: 'SE';
        mainCities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Stockholm, Göteborg, Malmö, Uppsala';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Stockholm, Göteborg, Malmö, Uppsala';
      },
      {
        name: 'Europe/Tirane';
        alternativeName: 'Central European Time';
        group: ['Europe/Tirane'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Albania';
        countryCode: 'AL';
        mainCities: ['Tirana', 'Durrës', 'Elbasan', 'Vlorë'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Tirana, Durrës, Elbasan, Vlorë';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Tirana, Durrës, Elbasan, Vlorë';
      },
      {
        name: 'Africa/Tunis';
        alternativeName: 'Central European Time';
        group: ['Africa/Tunis'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Tunisia';
        countryCode: 'TN';
        mainCities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Tunis, Sfax, Sousse, Kairouan';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Tunis, Sfax, Sousse, Kairouan';
      },
      {
        name: 'Europe/Vaduz';
        alternativeName: 'Central European Time';
        group: ['Europe/Vaduz'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Liechtenstein';
        countryCode: 'LI';
        mainCities: ['Vaduz'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Vaduz';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Vaduz';
      },
      {
        name: 'Europe/Vatican';
        alternativeName: 'Central European Time';
        group: ['Europe/Vatican'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Vatican';
        countryCode: 'VA';
        mainCities: ['Vatican City'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Vatican City';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Vatican City';
      },
      {
        name: 'Europe/Vienna';
        alternativeName: 'Central European Time';
        group: ['Europe/Vienna'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Austria';
        countryCode: 'AT';
        mainCities: ['Vienna', 'Graz', 'Linz', 'Favoriten'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Vienna, Graz, Linz, Favoriten';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Vienna, Graz, Linz, Favoriten';
      },
      {
        name: 'Europe/Warsaw';
        alternativeName: 'Central European Time';
        group: ['Europe/Warsaw', 'Poland'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Poland';
        countryCode: 'PL';
        mainCities: ['Warsaw', 'Łódź', 'Kraków', 'Wrocław'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Warsaw, Łódź, Kraków, Wrocław';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Warsaw, Łódź, Kraków, Wrocław';
      },
      {
        name: 'Europe/Zagreb';
        alternativeName: 'Central European Time';
        group: ['Europe/Zagreb'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Croatia';
        countryCode: 'HR';
        mainCities: ['Zagreb', 'Split', 'Rijeka', 'Osijek'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Zagreb, Split, Rijeka, Osijek';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Zagreb, Split, Rijeka, Osijek';
      },
      {
        name: 'Europe/Zurich';
        alternativeName: 'Central European Time';
        group: ['Europe/Zurich', 'Europe/Busingen'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Switzerland';
        countryCode: 'CH';
        mainCities: ['Zürich', 'Genève', 'Basel', 'Lausanne'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CET';
        rawFormat: '+01:00 Central European Time - Zürich, Genève, Basel, Lausanne';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Central European Time - Zürich, Genève, Basel, Lausanne';
      },
      {
        name: 'Africa/Bangui';
        alternativeName: 'West Africa Time';
        group: ['Africa/Bangui'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Central African Republic';
        countryCode: 'CF';
        mainCities: ['Bangui', 'Bimbo', 'Mbaïki', 'Berbérati'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Bangui, Bimbo, Mbaïki, Berbérati';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Bangui, Bimbo, Mbaïki, Berbérati';
      },
      {
        name: 'Africa/Malabo';
        alternativeName: 'West Africa Time';
        group: ['Africa/Malabo'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Equatorial Guinea';
        countryCode: 'GQ';
        mainCities: ['Bata', 'Malabo', 'Ebebiyin'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Bata, Malabo, Ebebiyin';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Bata, Malabo, Ebebiyin';
      },
      {
        name: 'Africa/Brazzaville';
        alternativeName: 'West Africa Time';
        group: ['Africa/Brazzaville'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Republic of the Congo';
        countryCode: 'CG';
        mainCities: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Kayes'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Brazzaville, Pointe-Noire, Dolisie, Kayes';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Brazzaville, Pointe-Noire, Dolisie, Kayes';
      },
      {
        name: 'Africa/Porto-Novo';
        alternativeName: 'West Africa Time';
        group: ['Africa/Porto-Novo'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Benin';
        countryCode: 'BJ';
        mainCities: ['Cotonou', 'Abomey-Calavi', 'Djougou', 'Porto-Novo'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Cotonou, Abomey-Calavi, Djougou, Porto-Novo';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Cotonou, Abomey-Calavi, Djougou, Porto-Novo';
      },
      {
        name: 'Africa/Douala';
        alternativeName: 'West Africa Time';
        group: ['Africa/Douala'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Cameroon';
        countryCode: 'CM';
        mainCities: ['Douala', 'Yaoundé', 'Garoua', 'Kousséri'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Douala, Yaoundé, Garoua, Kousséri';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Douala, Yaoundé, Garoua, Kousséri';
      },
      {
        name: 'Africa/Kinshasa';
        alternativeName: 'West Africa Time';
        group: ['Africa/Kinshasa'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Democratic Republic of the Congo';
        countryCode: 'CD';
        mainCities: ['Kinshasa', 'Masina', 'Kikwit', 'Mbandaka'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Kinshasa, Masina, Kikwit, Mbandaka';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Kinshasa, Masina, Kikwit, Mbandaka';
      },
      {
        name: 'Africa/Lagos';
        alternativeName: 'West Africa Time';
        group: ['Africa/Lagos'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Nigeria';
        countryCode: 'NG';
        mainCities: ['Lagos', 'Kano', 'Ibadan', 'Port Harcourt'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Lagos, Kano, Ibadan, Port Harcourt';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Lagos, Kano, Ibadan, Port Harcourt';
      },
      {
        name: 'Africa/Libreville';
        alternativeName: 'West Africa Time';
        group: ['Africa/Libreville'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Gabon';
        countryCode: 'GA';
        mainCities: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Libreville, Port-Gentil, Franceville, Oyem';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Libreville, Port-Gentil, Franceville, Oyem';
      },
      {
        name: 'Africa/Luanda';
        alternativeName: 'West Africa Time';
        group: ['Africa/Luanda'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Angola';
        countryCode: 'AO';
        mainCities: ['Luanda', 'N’dalatando', 'Huambo', 'Lobito'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Luanda, N’dalatando, Huambo, Lobito';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Luanda, N’dalatando, Huambo, Lobito';
      },
      {
        name: 'Africa/Ndjamena';
        alternativeName: 'West Africa Time';
        group: ['Africa/Ndjamena'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Chad';
        countryCode: 'TD';
        mainCities: ["N'Djamena", 'Moundou', 'Sarh', 'Abéché'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: "+01:00 West Africa Time - N'Djamena, Moundou, Sarh, Abéché";
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: "+01:00 West Africa Time - N'Djamena, Moundou, Sarh, Abéché";
      },
      {
        name: 'Africa/Niamey';
        alternativeName: 'West Africa Time';
        group: ['Africa/Niamey'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Niger';
        countryCode: 'NE';
        mainCities: ['Niamey', 'Zinder', 'Maradi', 'Agadez'];
        rawOffsetInMinutes: 60;
        abbreviation: 'WAT';
        rawFormat: '+01:00 West Africa Time - Niamey, Zinder, Maradi, Agadez';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 West Africa Time - Niamey, Zinder, Maradi, Agadez';
      },
      {
        name: 'Africa/Casablanca';
        alternativeName: 'Western European Time';
        group: ['Africa/Casablanca'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Morocco';
        countryCode: 'MA';
        mainCities: ['Casablanca', 'Rabat', 'Fès', 'Sale'];
        rawOffsetInMinutes: 0;
        abbreviation: 'WET';
        rawFormat: '+00:00 Western European Time - Casablanca, Rabat, Fès, Sale';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Western European Time - Casablanca, Rabat, Fès, Sale';
      },
      {
        name: 'Africa/El_Aaiun';
        alternativeName: 'Western European Time';
        group: ['Africa/El_Aaiun'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Western Sahara';
        countryCode: 'EH';
        mainCities: ['Laayoune', 'Dakhla'];
        rawOffsetInMinutes: 0;
        abbreviation: 'WET';
        rawFormat: '+00:00 Western European Time - Laayoune, Dakhla';
        currentTimeOffsetInMinutes: 60;
        currentTimeFormat: '+01:00 Western European Time - Laayoune, Dakhla';
      },
      {
        name: 'Africa/Bujumbura';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Bujumbura'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Burundi';
        countryCode: 'BI';
        mainCities: ['Bujumbura', 'Muyinga', 'Gitega', 'Ruyigi'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Bujumbura, Muyinga, Gitega, Ruyigi';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Bujumbura, Muyinga, Gitega, Ruyigi';
      },
      {
        name: 'Africa/Gaborone';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Gaborone'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Botswana';
        countryCode: 'BW';
        mainCities: ['Gaborone', 'Francistown', 'Molepolole', 'Selebi-Phikwe'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Gaborone, Francistown, Molepolole, Selebi-Phikwe';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Gaborone, Francistown, Molepolole, Selebi-Phikwe';
      },
      {
        name: 'Africa/Harare';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Harare'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Zimbabwe';
        countryCode: 'ZW';
        mainCities: ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Harare, Bulawayo, Chitungwiza, Mutare';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Harare, Bulawayo, Chitungwiza, Mutare';
      },
      {
        name: 'Africa/Juba';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Juba'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'South Sudan';
        countryCode: 'SS';
        mainCities: ['Juba', 'Winejok', 'Yei', 'Malakal'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Juba, Winejok, Yei, Malakal';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Juba, Winejok, Yei, Malakal';
      },
      {
        name: 'Africa/Khartoum';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Khartoum'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Sudan';
        countryCode: 'SD';
        mainCities: ['Khartoum', 'Omdurman', 'Nyala', 'Port Sudan'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Khartoum, Omdurman, Nyala, Port Sudan';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Khartoum, Omdurman, Nyala, Port Sudan';
      },
      {
        name: 'Africa/Kigali';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Kigali'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Rwanda';
        countryCode: 'RW';
        mainCities: ['Kigali', 'Gisenyi', 'Butare', 'Gitarama'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Kigali, Gisenyi, Butare, Gitarama';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Kigali, Gisenyi, Butare, Gitarama';
      },
      {
        name: 'Africa/Blantyre';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Blantyre'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Malawi';
        countryCode: 'MW';
        mainCities: ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Lilongwe, Blantyre, Mzuzu, Zomba';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Lilongwe, Blantyre, Mzuzu, Zomba';
      },
      {
        name: 'Africa/Lubumbashi';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Lubumbashi'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Democratic Republic of the Congo';
        countryCode: 'CD';
        mainCities: ['Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Kananga'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Lubumbashi, Mbuji-Mayi, Kisangani, Kananga';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Lubumbashi, Mbuji-Mayi, Kisangani, Kananga';
      },
      {
        name: 'Africa/Lusaka';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Lusaka'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Zambia';
        countryCode: 'ZM';
        mainCities: ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Lusaka, Kitwe, Ndola, Kabwe';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Lusaka, Kitwe, Ndola, Kabwe';
      },
      {
        name: 'Africa/Maputo';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Maputo'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Mozambique';
        countryCode: 'MZ';
        mainCities: ['Maputo', 'Matola', 'Nampula', 'Beira'];
        rawOffsetInMinutes: 120;
        abbreviation: 'CAT';
        rawFormat: '+02:00 Central Africa Time - Maputo, Matola, Nampula, Beira';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Maputo, Matola, Nampula, Beira';
      },
      {
        name: 'Africa/Windhoek';
        alternativeName: 'Central Africa Time';
        group: ['Africa/Windhoek'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Namibia';
        countryCode: 'NA';
        mainCities: ['Windhoek', 'Rundu', 'Walvis Bay', 'Oshakati'];
        rawOffsetInMinutes: 60;
        abbreviation: 'CAT';
        rawFormat: '+01:00 Central Africa Time - Windhoek, Rundu, Walvis Bay, Oshakati';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Central Africa Time - Windhoek, Rundu, Walvis Bay, Oshakati';
      },
      {
        name: 'Asia/Damascus';
        alternativeName: 'Eastern European Time';
        group: ['Asia/Damascus'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Syria';
        countryCode: 'SY';
        mainCities: ['Aleppo', 'Damascus', 'Homs', 'Ḩamāh'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Aleppo, Damascus, Homs, Ḩamāh';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Aleppo, Damascus, Homs, Ḩamāh';
      },
      {
        name: 'Asia/Amman';
        alternativeName: 'Eastern European Time';
        group: ['Asia/Amman'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Jordan';
        countryCode: 'JO';
        mainCities: ['Amman', 'Zarqa', 'Irbid', 'Russeifa'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Amman, Zarqa, Irbid, Russeifa';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Amman, Zarqa, Irbid, Russeifa';
      },
      {
        name: 'Europe/Athens';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Athens'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Greece';
        countryCode: 'GR';
        mainCities: ['Athens', 'Thessaloníki', 'Pátra', 'Piraeus'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Athens, Thessaloníki, Pátra, Piraeus';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Athens, Thessaloníki, Pátra, Piraeus';
      },
      {
        name: 'Asia/Beirut';
        alternativeName: 'Eastern European Time';
        group: ['Asia/Beirut'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Lebanon';
        countryCode: 'LB';
        mainCities: ['Beirut', 'Ra’s Bayrūt', 'Tripoli', 'Sidon'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Beirut, Ra’s Bayrūt, Tripoli, Sidon';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Beirut, Ra’s Bayrūt, Tripoli, Sidon';
      },
      {
        name: 'Europe/Bucharest';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Bucharest'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Romania';
        countryCode: 'RO';
        mainCities: ['Bucharest', 'Sector 3', 'Iaşi', 'Sector 6'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Bucharest, Sector 3, Iaşi, Sector 6';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Bucharest, Sector 3, Iaşi, Sector 6';
      },
      {
        name: 'Africa/Cairo';
        alternativeName: 'Eastern European Time';
        group: ['Africa/Cairo', 'Egypt'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Egypt';
        countryCode: 'EG';
        mainCities: ['Cairo', 'Alexandria', 'Giza', 'Shubrā al Khaymah'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Cairo, Alexandria, Giza, Shubrā al Khaymah';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Cairo, Alexandria, Giza, Shubrā al Khaymah';
      },
      {
        name: 'Europe/Chisinau';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Chisinau', 'Europe/Tiraspol'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Moldova';
        countryCode: 'MD';
        mainCities: ['Chisinau', 'Tiraspol', 'Bălţi', 'Bender'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Chisinau, Tiraspol, Bălţi, Bender';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Chisinau, Tiraspol, Bălţi, Bender';
      },
      {
        name: 'Asia/Hebron';
        alternativeName: 'Eastern European Time';
        group: ['Asia/Gaza', 'Asia/Hebron'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Palestinian Territory';
        countryCode: 'PS';
        mainCities: ['East Jerusalem', 'Gaza', 'Khān Yūnis', 'Jabālyā'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - East Jerusalem, Gaza, Khān Yūnis, Jabālyā';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - East Jerusalem, Gaza, Khān Yūnis, Jabālyā';
      },
      {
        name: 'Europe/Helsinki';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Helsinki'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Finland';
        countryCode: 'FI';
        mainCities: ['Helsinki', 'Espoo', 'Tampere', 'Oulu'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Helsinki, Espoo, Tampere, Oulu';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Helsinki, Espoo, Tampere, Oulu';
      },
      {
        name: 'Europe/Kaliningrad';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Kaliningrad'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Kaliningrad', 'Chernyakhovsk', 'Sovetsk', 'Baltiysk'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Kaliningrad, Chernyakhovsk, Sovetsk, Baltiysk';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Kaliningrad, Chernyakhovsk, Sovetsk, Baltiysk';
      },
      {
        name: 'Europe/Mariehamn';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Mariehamn'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Aland Islands';
        countryCode: 'AX';
        mainCities: ['Mariehamn'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Mariehamn';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Mariehamn';
      },
      {
        name: 'Asia/Nicosia';
        alternativeName: 'Eastern European Time';
        group: ['Asia/Famagusta', 'Asia/Nicosia', 'Europe/Nicosia'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Cyprus';
        countryCode: 'CY';
        mainCities: ['Nicosia', 'Limassol', 'Larnaca', 'Stróvolos'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Nicosia, Limassol, Larnaca, Stróvolos';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Nicosia, Limassol, Larnaca, Stróvolos';
      },
      {
        name: 'Europe/Riga';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Riga'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Latvia';
        countryCode: 'LV';
        mainCities: ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Riga, Daugavpils, Liepāja, Jelgava';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Riga, Daugavpils, Liepāja, Jelgava';
      },
      {
        name: 'Europe/Sofia';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Sofia'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Bulgaria';
        countryCode: 'BG';
        mainCities: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Sofia, Plovdiv, Varna, Burgas';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Sofia, Plovdiv, Varna, Burgas';
      },
      {
        name: 'Europe/Tallinn';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Tallinn'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Estonia';
        countryCode: 'EE';
        mainCities: ['Tallinn', 'Tartu', 'Narva', 'Kohtla-Järve'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Tallinn, Tartu, Narva, Kohtla-Järve';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Tallinn, Tartu, Narva, Kohtla-Järve';
      },
      {
        name: 'Africa/Tripoli';
        alternativeName: 'Eastern European Time';
        group: ['Africa/Tripoli', 'Libya'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Libya';
        countryCode: 'LY';
        mainCities: ['Tripoli', 'Benghazi', 'Ajdabiya', 'Mişrātah'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Tripoli, Benghazi, Ajdabiya, Mişrātah';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Tripoli, Benghazi, Ajdabiya, Mişrātah';
      },
      {
        name: 'Europe/Vilnius';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Vilnius'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Lithuania';
        countryCode: 'LT';
        mainCities: ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Vilnius, Kaunas, Klaipėda, Šiauliai';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Vilnius, Kaunas, Klaipėda, Šiauliai';
      },
      {
        name: 'Europe/Zaporozhye';
        alternativeName: 'Eastern European Time';
        group: ['Europe/Uzhgorod', 'Europe/Zaporozhye'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Ukraine';
        countryCode: 'UA';
        mainCities: ['Zaporizhzhya', 'Luhansk', 'Melitopol', 'Sievierodonetsk'];
        rawOffsetInMinutes: 120;
        abbreviation: 'EET';
        rawFormat: '+02:00 Eastern European Time - Zaporizhzhya, Luhansk, Melitopol, Sievierodonetsk';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Eastern European Time - Zaporizhzhya, Luhansk, Melitopol, Sievierodonetsk';
      },
      {
        name: 'Asia/Jerusalem';
        alternativeName: 'Israel Time';
        group: ['Asia/Jerusalem', 'Asia/Tel_Aviv', 'Israel'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Israel';
        countryCode: 'IL';
        mainCities: ['Jerusalem', 'Tel Aviv', 'West Jerusalem', 'Haifa'];
        rawOffsetInMinutes: 120;
        abbreviation: 'IST';
        rawFormat: '+02:00 Israel Time - Jerusalem, Tel Aviv, West Jerusalem, Haifa';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 Israel Time - Jerusalem, Tel Aviv, West Jerusalem, Haifa';
      },
      {
        name: 'Africa/Johannesburg';
        alternativeName: 'South Africa Time';
        group: ['Africa/Johannesburg'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'South Africa';
        countryCode: 'ZA';
        mainCities: ['Johannesburg', 'Cape Town', 'Durban', 'Soweto'];
        rawOffsetInMinutes: 120;
        abbreviation: 'SAST';
        rawFormat: '+02:00 South Africa Time - Johannesburg, Cape Town, Durban, Soweto';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 South Africa Time - Johannesburg, Cape Town, Durban, Soweto';
      },
      {
        name: 'Africa/Mbabane';
        alternativeName: 'South Africa Time';
        group: ['Africa/Mbabane'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Eswatini';
        countryCode: 'SZ';
        mainCities: ['Manzini', 'Mbabane', 'Lobamba'];
        rawOffsetInMinutes: 120;
        abbreviation: 'SAST';
        rawFormat: '+02:00 South Africa Time - Manzini, Mbabane, Lobamba';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 South Africa Time - Manzini, Mbabane, Lobamba';
      },
      {
        name: 'Africa/Maseru';
        alternativeName: 'South Africa Time';
        group: ['Africa/Maseru'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Lesotho';
        countryCode: 'LS';
        mainCities: ['Maseru', 'Mafeteng', 'Leribe', 'Maputsoe'];
        rawOffsetInMinutes: 120;
        abbreviation: 'SAST';
        rawFormat: '+02:00 South Africa Time - Maseru, Mafeteng, Leribe, Maputsoe';
        currentTimeOffsetInMinutes: 120;
        currentTimeFormat: '+02:00 South Africa Time - Maseru, Mafeteng, Leribe, Maputsoe';
      },
      {
        name: 'Asia/Kuwait';
        alternativeName: 'Arabian Time';
        group: ['Asia/Kuwait'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Kuwait';
        countryCode: 'KW';
        mainCities: ['Al Aḩmadī', 'Ḩawallī', 'As Sālimīyah', 'Şabāḩ as Sālim'];
        rawOffsetInMinutes: 180;
        abbreviation: 'AST';
        rawFormat: '+03:00 Arabian Time - Al Aḩmadī, Ḩawallī, As Sālimīyah, Şabāḩ as Sālim';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Arabian Time - Al Aḩmadī, Ḩawallī, As Sālimīyah, Şabāḩ as Sālim';
      },
      {
        name: 'Asia/Baghdad';
        alternativeName: 'Arabian Time';
        group: ['Asia/Baghdad'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Iraq';
        countryCode: 'IQ';
        mainCities: ['Baghdad', 'Basrah', 'Al Mawşil al Jadīdah', 'Al Başrah al Qadīmah'];
        rawOffsetInMinutes: 180;
        abbreviation: 'AST';
        rawFormat: '+03:00 Arabian Time - Baghdad, Basrah, Al Mawşil al Jadīdah, Al Başrah al Qadīmah';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Arabian Time - Baghdad, Basrah, Al Mawşil al Jadīdah, Al Başrah al Qadīmah';
      },
      {
        name: 'Asia/Qatar';
        alternativeName: 'Arabian Time';
        group: ['Asia/Qatar'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Qatar';
        countryCode: 'QA';
        mainCities: ['Doha', 'Ar Rayyān', 'Umm Şalāl Muḩammad', 'Al Wakrah'];
        rawOffsetInMinutes: 180;
        abbreviation: 'AST';
        rawFormat: '+03:00 Arabian Time - Doha, Ar Rayyān, Umm Şalāl Muḩammad, Al Wakrah';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Arabian Time - Doha, Ar Rayyān, Umm Şalāl Muḩammad, Al Wakrah';
      },
      {
        name: 'Asia/Bahrain';
        alternativeName: 'Arabian Time';
        group: ['Asia/Bahrain'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Bahrain';
        countryCode: 'BH';
        mainCities: ['Manama', 'Al Muharraq', 'Ar Rifā‘', 'Dār Kulayb'];
        rawOffsetInMinutes: 180;
        abbreviation: 'AST';
        rawFormat: '+03:00 Arabian Time - Manama, Al Muharraq, Ar Rifā‘, Dār Kulayb';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Arabian Time - Manama, Al Muharraq, Ar Rifā‘, Dār Kulayb';
      },
      {
        name: 'Asia/Riyadh';
        alternativeName: 'Arabian Time';
        group: ['Asia/Riyadh'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Saudi Arabia';
        countryCode: 'SA';
        mainCities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina'];
        rawOffsetInMinutes: 180;
        abbreviation: 'AST';
        rawFormat: '+03:00 Arabian Time - Riyadh, Jeddah, Mecca, Medina';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Arabian Time - Riyadh, Jeddah, Mecca, Medina';
      },
      {
        name: 'Asia/Aden';
        alternativeName: 'Arabian Time';
        group: ['Asia/Aden'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Yemen';
        countryCode: 'YE';
        mainCities: ['Sanaa', 'Al Ḩudaydah', 'Taiz', 'Aden'];
        rawOffsetInMinutes: 180;
        abbreviation: 'AST';
        rawFormat: '+03:00 Arabian Time - Sanaa, Al Ḩudaydah, Taiz, Aden';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Arabian Time - Sanaa, Al Ḩudaydah, Taiz, Aden';
      },
      {
        name: 'Africa/Addis_Ababa';
        alternativeName: 'East Africa Time';
        group: ['Africa/Addis_Ababa'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Ethiopia';
        countryCode: 'ET';
        mainCities: ['Addis Ababa', 'Dire Dawa', "Mek'ele", 'Nazrēt'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: "+03:00 East Africa Time - Addis Ababa, Dire Dawa, Mek'ele, Nazrēt";
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: "+03:00 East Africa Time - Addis Ababa, Dire Dawa, Mek'ele, Nazrēt";
      },
      {
        name: 'Indian/Antananarivo';
        alternativeName: 'East Africa Time';
        group: ['Indian/Antananarivo'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Madagascar';
        countryCode: 'MG';
        mainCities: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Antananarivo, Toamasina, Antsirabe, Mahajanga';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Antananarivo, Toamasina, Antsirabe, Mahajanga';
      },
      {
        name: 'Africa/Asmara';
        alternativeName: 'East Africa Time';
        group: ['Africa/Asmara'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Eritrea';
        countryCode: 'ER';
        mainCities: ['Asmara', 'Keren', 'Massawa', 'Assab'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Asmara, Keren, Massawa, Assab';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Asmara, Keren, Massawa, Assab';
      },
      {
        name: 'Africa/Dar_es_Salaam';
        alternativeName: 'East Africa Time';
        group: ['Africa/Dar_es_Salaam'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Tanzania';
        countryCode: 'TZ';
        mainCities: ['Dar es Salaam', 'Mwanza', 'Zanzibar', 'Arusha'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Dar es Salaam, Mwanza, Zanzibar, Arusha';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Dar es Salaam, Mwanza, Zanzibar, Arusha';
      },
      {
        name: 'Africa/Djibouti';
        alternativeName: 'East Africa Time';
        group: ['Africa/Djibouti'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Djibouti';
        countryCode: 'DJ';
        mainCities: ['Djibouti', "'Ali Sabieh", 'Tadjourah', 'Obock'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: "+03:00 East Africa Time - Djibouti, 'Ali Sabieh, Tadjourah, Obock";
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: "+03:00 East Africa Time - Djibouti, 'Ali Sabieh, Tadjourah, Obock";
      },
      {
        name: 'Africa/Kampala';
        alternativeName: 'East Africa Time';
        group: ['Africa/Kampala'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Uganda';
        countryCode: 'UG';
        mainCities: ['Kampala', 'Gulu', 'Lira', 'Mbarara'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Kampala, Gulu, Lira, Mbarara';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Kampala, Gulu, Lira, Mbarara';
      },
      {
        name: 'Indian/Mayotte';
        alternativeName: 'East Africa Time';
        group: ['Indian/Mayotte'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Mayotte';
        countryCode: 'YT';
        mainCities: ['Mamoudzou', 'Koungou', 'Dzaoudzi'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Mamoudzou, Koungou, Dzaoudzi';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Mamoudzou, Koungou, Dzaoudzi';
      },
      {
        name: 'Africa/Mogadishu';
        alternativeName: 'East Africa Time';
        group: ['Africa/Mogadishu'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Somalia';
        countryCode: 'SO';
        mainCities: ['Mogadishu', 'Hargeysa', 'Berbera', 'Kismayo'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Mogadishu, Hargeysa, Berbera, Kismayo';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Mogadishu, Hargeysa, Berbera, Kismayo';
      },
      {
        name: 'Indian/Comoro';
        alternativeName: 'East Africa Time';
        group: ['Indian/Comoro'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Comoros';
        countryCode: 'KM';
        mainCities: ['Moroni', 'Moutsamoudou'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Moroni, Moutsamoudou';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Moroni, Moutsamoudou';
      },
      {
        name: 'Africa/Nairobi';
        alternativeName: 'East Africa Time';
        group: ['Africa/Nairobi', 'Africa/Asmera'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Kenya';
        countryCode: 'KE';
        mainCities: ['Nairobi', 'Kakamega', 'Mombasa', 'Ruiru'];
        rawOffsetInMinutes: 180;
        abbreviation: 'EAT';
        rawFormat: '+03:00 East Africa Time - Nairobi, Kakamega, Mombasa, Ruiru';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 East Africa Time - Nairobi, Kakamega, Mombasa, Ruiru';
      },
      {
        name: 'Europe/Minsk';
        alternativeName: 'Moscow Time';
        group: ['Europe/Minsk'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Belarus';
        countryCode: 'BY';
        mainCities: ['Minsk', "Homyel'", 'Mahilyow', 'Vitebsk'];
        rawOffsetInMinutes: 180;
        abbreviation: 'MSK';
        rawFormat: "+03:00 Moscow Time - Minsk, Homyel', Mahilyow, Vitebsk";
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: "+03:00 Moscow Time - Minsk, Homyel', Mahilyow, Vitebsk";
      },
      {
        name: 'Europe/Moscow';
        alternativeName: 'Moscow Time';
        group: ['Europe/Kirov', 'Europe/Moscow', 'Europe/Volgograd', 'W-SU'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Moscow', 'Saint Petersburg', 'Nizhniy Novgorod', 'Kazan'];
        rawOffsetInMinutes: 180;
        abbreviation: 'MSK';
        rawFormat: '+03:00 Moscow Time - Moscow, Saint Petersburg, Nizhniy Novgorod, Kazan';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Moscow Time - Moscow, Saint Petersburg, Nizhniy Novgorod, Kazan';
      },
      {
        name: 'Europe/Simferopol';
        alternativeName: 'Moscow Time';
        group: ['Europe/Simferopol'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Ukraine';
        countryCode: 'UA';
        mainCities: ['Sevastopol', 'Simferopol', 'Kerch', 'Yevpatoriya'];
        rawOffsetInMinutes: 180;
        abbreviation: 'MSK';
        rawFormat: '+03:00 Moscow Time - Sevastopol, Simferopol, Kerch, Yevpatoriya';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Moscow Time - Sevastopol, Simferopol, Kerch, Yevpatoriya';
      },
      {
        name: 'Antarctica/Syowa';
        alternativeName: 'Syowa Time';
        group: ['Antarctica/Syowa'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['Syowa'];
        rawOffsetInMinutes: 180;
        abbreviation: 'SYOT';
        rawFormat: '+03:00 Syowa Time - Syowa';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Syowa Time - Syowa';
      },
      {
        name: 'Europe/Istanbul';
        alternativeName: 'Turkey Time';
        group: ['Europe/Istanbul', 'Turkey', 'Asia/Istanbul'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Turkey';
        countryCode: 'TR';
        mainCities: ['Istanbul', 'Ankara', 'İzmir', 'Bursa'];
        rawOffsetInMinutes: 180;
        abbreviation: 'TRT';
        rawFormat: '+03:00 Turkey Time - Istanbul, Ankara, İzmir, Bursa';
        currentTimeOffsetInMinutes: 180;
        currentTimeFormat: '+03:00 Turkey Time - Istanbul, Ankara, İzmir, Bursa';
      },
      {
        name: 'Asia/Tehran';
        alternativeName: 'Iran Time';
        group: ['Asia/Tehran', 'Iran'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Iran';
        countryCode: 'IR';
        mainCities: ['Tehran', 'Mashhad', 'Isfahan', 'Karaj'];
        rawOffsetInMinutes: 210;
        abbreviation: 'IRST';
        rawFormat: '+03:30 Iran Time - Tehran, Mashhad, Isfahan, Karaj';
        currentTimeOffsetInMinutes: 210;
        currentTimeFormat: '+03:30 Iran Time - Tehran, Mashhad, Isfahan, Karaj';
      },
      {
        name: 'Asia/Yerevan';
        alternativeName: 'Armenia Time';
        group: ['Asia/Yerevan'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Armenia';
        countryCode: 'AM';
        mainCities: ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat'];
        rawOffsetInMinutes: 240;
        abbreviation: 'AMT';
        rawFormat: '+04:00 Armenia Time - Yerevan, Gyumri, Vanadzor, Vagharshapat';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Armenia Time - Yerevan, Gyumri, Vanadzor, Vagharshapat';
      },
      {
        name: 'Asia/Baku';
        alternativeName: 'Azerbaijan Time';
        group: ['Asia/Baku'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Azerbaijan';
        countryCode: 'AZ';
        mainCities: ['Baku', 'Ganja', 'Sumqayıt', 'Lankaran'];
        rawOffsetInMinutes: 240;
        abbreviation: 'AZT';
        rawFormat: '+04:00 Azerbaijan Time - Baku, Ganja, Sumqayıt, Lankaran';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Azerbaijan Time - Baku, Ganja, Sumqayıt, Lankaran';
      },
      {
        name: 'Asia/Tbilisi';
        alternativeName: 'Georgia Time';
        group: ['Asia/Tbilisi'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Georgia';
        countryCode: 'GE';
        mainCities: ['Tbilisi', 'Kutaisi', 'Batumi', 'Sokhumi'];
        rawOffsetInMinutes: 240;
        abbreviation: 'GET';
        rawFormat: '+04:00 Georgia Time - Tbilisi, Kutaisi, Batumi, Sokhumi';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Georgia Time - Tbilisi, Kutaisi, Batumi, Sokhumi';
      },
      {
        name: 'Asia/Dubai';
        alternativeName: 'Gulf Time';
        group: ['Asia/Dubai'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'United Arab Emirates';
        countryCode: 'AE';
        mainCities: ['Dubai', 'Sharjah', 'Abu Dhabi', 'Ajman City'];
        rawOffsetInMinutes: 240;
        abbreviation: 'GST';
        rawFormat: '+04:00 Gulf Time - Dubai, Sharjah, Abu Dhabi, Ajman City';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Gulf Time - Dubai, Sharjah, Abu Dhabi, Ajman City';
      },
      {
        name: 'Asia/Muscat';
        alternativeName: 'Gulf Time';
        group: ['Asia/Muscat'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Oman';
        countryCode: 'OM';
        mainCities: ['Muscat', 'Seeb', 'Şalālah', 'Bawshar'];
        rawOffsetInMinutes: 240;
        abbreviation: 'GST';
        rawFormat: '+04:00 Gulf Time - Muscat, Seeb, Şalālah, Bawshar';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Gulf Time - Muscat, Seeb, Şalālah, Bawshar';
      },
      {
        name: 'Indian/Mauritius';
        alternativeName: 'Mauritius Time';
        group: ['Indian/Mauritius'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Mauritius';
        countryCode: 'MU';
        mainCities: ['Port Louis', 'Beau Bassin-Rose Hill', 'Vacoas', 'Curepipe'];
        rawOffsetInMinutes: 240;
        abbreviation: 'MUT';
        rawFormat: '+04:00 Mauritius Time - Port Louis, Beau Bassin-Rose Hill, Vacoas, Curepipe';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Mauritius Time - Port Louis, Beau Bassin-Rose Hill, Vacoas, Curepipe';
      },
      {
        name: 'Indian/Reunion';
        alternativeName: 'Réunion Time';
        group: ['Indian/Reunion'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Reunion';
        countryCode: 'RE';
        mainCities: ['Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon'];
        rawOffsetInMinutes: 240;
        abbreviation: 'RET';
        rawFormat: '+04:00 Réunion Time - Saint-Denis, Saint-Paul, Saint-Pierre, Le Tampon';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Réunion Time - Saint-Denis, Saint-Paul, Saint-Pierre, Le Tampon';
      },
      {
        name: 'Europe/Samara';
        alternativeName: 'Samara Time';
        group: ['Europe/Astrakhan', 'Europe/Samara', 'Europe/Saratov', 'Europe/Ulyanovsk'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Samara', 'Saratov', 'Tolyatti', 'Izhevsk'];
        rawOffsetInMinutes: 240;
        abbreviation: 'SAMT';
        rawFormat: '+04:00 Samara Time - Samara, Saratov, Tolyatti, Izhevsk';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Samara Time - Samara, Saratov, Tolyatti, Izhevsk';
      },
      {
        name: 'Indian/Mahe';
        alternativeName: 'Seychelles Time';
        group: ['Indian/Mahe'];
        continentCode: 'AF';
        continentName: 'Africa';
        countryName: 'Seychelles';
        countryCode: 'SC';
        mainCities: ['Victoria'];
        rawOffsetInMinutes: 240;
        abbreviation: 'SCT';
        rawFormat: '+04:00 Seychelles Time - Victoria';
        currentTimeOffsetInMinutes: 240;
        currentTimeFormat: '+04:00 Seychelles Time - Victoria';
      },
      {
        name: 'Asia/Kabul';
        alternativeName: 'Afghanistan Time';
        group: ['Asia/Kabul'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Afghanistan';
        countryCode: 'AF';
        mainCities: ['Kabul', 'Herāt', 'Mazār-e Sharīf', 'Kandahār'];
        rawOffsetInMinutes: 270;
        abbreviation: 'AFT';
        rawFormat: '+04:30 Afghanistan Time - Kabul, Herāt, Mazār-e Sharīf, Kandahār';
        currentTimeOffsetInMinutes: 270;
        currentTimeFormat: '+04:30 Afghanistan Time - Kabul, Herāt, Mazār-e Sharīf, Kandahār';
      },
      {
        name: 'Indian/Kerguelen';
        alternativeName: 'French Southern & Antarctic Time';
        group: ['Indian/Kerguelen'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'French Southern Territories';
        countryCode: 'TF';
        mainCities: ['Port-aux-Français'];
        rawOffsetInMinutes: 300;
        abbreviation: 'FSAT';
        rawFormat: '+05:00 French Southern & Antarctic Time - Port-aux-Français';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 French Southern & Antarctic Time - Port-aux-Français';
      },
      {
        name: 'Indian/Maldives';
        alternativeName: 'Maldives Time';
        group: ['Indian/Maldives'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Maldives';
        countryCode: 'MV';
        mainCities: ['Male'];
        rawOffsetInMinutes: 300;
        abbreviation: 'MVT';
        rawFormat: '+05:00 Maldives Time - Male';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 Maldives Time - Male';
      },
      {
        name: 'Antarctica/Mawson';
        alternativeName: 'Mawson Time';
        group: ['Antarctica/Mawson'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['Mawson'];
        rawOffsetInMinutes: 300;
        abbreviation: 'MAWT';
        rawFormat: '+05:00 Mawson Time - Mawson';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 Mawson Time - Mawson';
      },
      {
        name: 'Asia/Karachi';
        alternativeName: 'Pakistan Time';
        group: ['Asia/Karachi'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Pakistan';
        countryCode: 'PK';
        mainCities: ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi'];
        rawOffsetInMinutes: 300;
        abbreviation: 'PKT';
        rawFormat: '+05:00 Pakistan Time - Karachi, Lahore, Faisalabad, Rawalpindi';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 Pakistan Time - Karachi, Lahore, Faisalabad, Rawalpindi';
      },
      {
        name: 'Asia/Dushanbe';
        alternativeName: 'Tajikistan Time';
        group: ['Asia/Dushanbe'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Tajikistan';
        countryCode: 'TJ';
        mainCities: ['Dushanbe', 'Isfara', 'Istaravshan', 'Kŭlob'];
        rawOffsetInMinutes: 300;
        abbreviation: 'TJT';
        rawFormat: '+05:00 Tajikistan Time - Dushanbe, Isfara, Istaravshan, Kŭlob';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 Tajikistan Time - Dushanbe, Isfara, Istaravshan, Kŭlob';
      },
      {
        name: 'Asia/Ashgabat';
        alternativeName: 'Turkmenistan Time';
        group: ['Asia/Ashgabat', 'Asia/Ashkhabad'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Turkmenistan';
        countryCode: 'TM';
        mainCities: ['Ashgabat', 'Türkmenabat', 'Daşoguz', 'Mary'];
        rawOffsetInMinutes: 300;
        abbreviation: 'TMT';
        rawFormat: '+05:00 Turkmenistan Time - Ashgabat, Türkmenabat, Daşoguz, Mary';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 Turkmenistan Time - Ashgabat, Türkmenabat, Daşoguz, Mary';
      },
      {
        name: 'Asia/Tashkent';
        alternativeName: 'Uzbekistan Time';
        group: ['Asia/Samarkand', 'Asia/Tashkent'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Uzbekistan';
        countryCode: 'UZ';
        mainCities: ['Tashkent', 'Namangan', 'Samarkand', 'Andijon'];
        rawOffsetInMinutes: 300;
        abbreviation: 'UZT';
        rawFormat: '+05:00 Uzbekistan Time - Tashkent, Namangan, Samarkand, Andijon';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 Uzbekistan Time - Tashkent, Namangan, Samarkand, Andijon';
      },
      {
        name: 'Asia/Aqtobe';
        alternativeName: 'West Kazakhstan Time';
        group: ['Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Atyrau', 'Asia/Oral', 'Asia/Qyzylorda'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Kazakhstan';
        countryCode: 'KZ';
        mainCities: ['Aktobe', 'Kyzylorda', 'Oral', 'Atyrau'];
        rawOffsetInMinutes: 300;
        abbreviation: 'AQTT';
        rawFormat: '+05:00 West Kazakhstan Time - Aktobe, Kyzylorda, Oral, Atyrau';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 West Kazakhstan Time - Aktobe, Kyzylorda, Oral, Atyrau';
      },
      {
        name: 'Asia/Yekaterinburg';
        alternativeName: 'Yekaterinburg Time';
        group: ['Asia/Yekaterinburg'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Yekaterinburg', 'Chelyabinsk', 'Ufa', 'Perm'];
        rawOffsetInMinutes: 300;
        abbreviation: 'YEKT';
        rawFormat: '+05:00 Yekaterinburg Time - Yekaterinburg, Chelyabinsk, Ufa, Perm';
        currentTimeOffsetInMinutes: 300;
        currentTimeFormat: '+05:00 Yekaterinburg Time - Yekaterinburg, Chelyabinsk, Ufa, Perm';
      },
      {
        name: 'Asia/Colombo';
        alternativeName: 'India Time';
        group: ['Asia/Colombo'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Sri Lanka';
        countryCode: 'LK';
        mainCities: ['Colombo', 'Dehiwala-Mount Lavinia', 'Maharagama', 'Jaffna'];
        rawOffsetInMinutes: 330;
        abbreviation: 'IST';
        rawFormat: '+05:30 India Time - Colombo, Dehiwala-Mount Lavinia, Maharagama, Jaffna';
        currentTimeOffsetInMinutes: 330;
        currentTimeFormat: '+05:30 India Time - Colombo, Dehiwala-Mount Lavinia, Maharagama, Jaffna';
      },
      {
        name: 'Asia/Kolkata';
        alternativeName: 'India Time';
        group: ['Asia/Kolkata', 'Asia/Calcutta'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'India';
        countryCode: 'IN';
        mainCities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderābād'];
        rawOffsetInMinutes: 330;
        abbreviation: 'IST';
        rawFormat: '+05:30 India Time - Mumbai, Delhi, Bengaluru, Hyderābād';
        currentTimeOffsetInMinutes: 330;
        currentTimeFormat: '+05:30 India Time - Mumbai, Delhi, Bengaluru, Hyderābād';
      },
      {
        name: 'Asia/Kathmandu';
        alternativeName: 'Nepal Time';
        group: ['Asia/Kathmandu', 'Asia/Katmandu'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Nepal';
        countryCode: 'NP';
        mainCities: ['Kathmandu', 'Pokhara', 'Pātan', 'Biratnagar'];
        rawOffsetInMinutes: 345;
        abbreviation: 'NPT';
        rawFormat: '+05:45 Nepal Time - Kathmandu, Pokhara, Pātan, Biratnagar';
        currentTimeOffsetInMinutes: 345;
        currentTimeFormat: '+05:45 Nepal Time - Kathmandu, Pokhara, Pātan, Biratnagar';
      },
      {
        name: 'Asia/Dhaka';
        alternativeName: 'Bangladesh Time';
        group: ['Asia/Dhaka', 'Asia/Dacca'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Bangladesh';
        countryCode: 'BD';
        mainCities: ['Dhaka', 'Chattogram', 'Khulna', 'Rājshāhi'];
        rawOffsetInMinutes: 360;
        abbreviation: 'BST';
        rawFormat: '+06:00 Bangladesh Time - Dhaka, Chattogram, Khulna, Rājshāhi';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 Bangladesh Time - Dhaka, Chattogram, Khulna, Rājshāhi';
      },
      {
        name: 'Asia/Thimphu';
        alternativeName: 'Bhutan Time';
        group: ['Asia/Thimphu', 'Asia/Thimbu'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Bhutan';
        countryCode: 'BT';
        mainCities: ['Thimphu', 'Tsirang', 'Punākha', 'Phuntsholing'];
        rawOffsetInMinutes: 360;
        abbreviation: 'BTT';
        rawFormat: '+06:00 Bhutan Time - Thimphu, Tsirang, Punākha, Phuntsholing';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 Bhutan Time - Thimphu, Tsirang, Punākha, Phuntsholing';
      },
      {
        name: 'Asia/Urumqi';
        alternativeName: 'China Time';
        group: ['Asia/Urumqi', 'Asia/Kashgar'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'China';
        countryCode: 'CN';
        mainCities: ['Ürümqi', 'Shihezi', 'Korla', 'Aksu'];
        rawOffsetInMinutes: 360;
        abbreviation: 'CST';
        rawFormat: '+06:00 China Time - Ürümqi, Shihezi, Korla, Aksu';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 China Time - Ürümqi, Shihezi, Korla, Aksu';
      },
      {
        name: 'Asia/Almaty';
        alternativeName: 'East Kazakhstan Time';
        group: ['Asia/Almaty', 'Asia/Qostanay'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Kazakhstan';
        countryCode: 'KZ';
        mainCities: ['Almaty', 'Shymkent', 'Karagandy', 'Taraz'];
        rawOffsetInMinutes: 360;
        abbreviation: 'ALMT';
        rawFormat: '+06:00 East Kazakhstan Time - Almaty, Shymkent, Karagandy, Taraz';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 East Kazakhstan Time - Almaty, Shymkent, Karagandy, Taraz';
      },
      {
        name: 'Indian/Chagos';
        alternativeName: 'Indian Ocean Time';
        group: ['Indian/Chagos'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'British Indian Ocean Territory';
        countryCode: 'IO';
        mainCities: ['Chagos'];
        rawOffsetInMinutes: 360;
        abbreviation: 'IOT';
        rawFormat: '+06:00 Indian Ocean Time - Chagos';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 Indian Ocean Time - Chagos';
      },
      {
        name: 'Asia/Bishkek';
        alternativeName: 'Kyrgyzstan Time';
        group: ['Asia/Bishkek'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Kyrgyzstan';
        countryCode: 'KG';
        mainCities: ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol'];
        rawOffsetInMinutes: 360;
        abbreviation: 'KGT';
        rawFormat: '+06:00 Kyrgyzstan Time - Bishkek, Osh, Jalal-Abad, Karakol';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 Kyrgyzstan Time - Bishkek, Osh, Jalal-Abad, Karakol';
      },
      {
        name: 'Asia/Omsk';
        alternativeName: 'Omsk Time';
        group: ['Asia/Omsk'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Omsk', 'Tara', 'Kalachinsk'];
        rawOffsetInMinutes: 360;
        abbreviation: 'OMST';
        rawFormat: '+06:00 Omsk Time - Omsk, Tara, Kalachinsk';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 Omsk Time - Omsk, Tara, Kalachinsk';
      },
      {
        name: 'Antarctica/Vostok';
        alternativeName: 'Vostok Time';
        group: ['Antarctica/Vostok'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['Vostok'];
        rawOffsetInMinutes: 360;
        abbreviation: 'VOST';
        rawFormat: '+06:00 Vostok Time - Vostok';
        currentTimeOffsetInMinutes: 360;
        currentTimeFormat: '+06:00 Vostok Time - Vostok';
      },
      {
        name: 'Indian/Cocos';
        alternativeName: 'Cocos Islands Time';
        group: ['Indian/Cocos'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Cocos Islands';
        countryCode: 'CC';
        mainCities: ['West Island'];
        rawOffsetInMinutes: 390;
        abbreviation: 'CCT';
        rawFormat: '+06:30 Cocos Islands Time - West Island';
        currentTimeOffsetInMinutes: 390;
        currentTimeFormat: '+06:30 Cocos Islands Time - West Island';
      },
      {
        name: 'Asia/Yangon';
        alternativeName: 'Myanmar Time';
        group: ['Asia/Yangon', 'Asia/Rangoon'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Myanmar';
        countryCode: 'MM';
        mainCities: ['Yangon', 'Mandalay', 'Nay Pyi Taw', 'Mawlamyine'];
        rawOffsetInMinutes: 390;
        abbreviation: 'MMT';
        rawFormat: '+06:30 Myanmar Time - Yangon, Mandalay, Nay Pyi Taw, Mawlamyine';
        currentTimeOffsetInMinutes: 390;
        currentTimeFormat: '+06:30 Myanmar Time - Yangon, Mandalay, Nay Pyi Taw, Mawlamyine';
      },
      {
        name: 'Indian/Christmas';
        alternativeName: 'Christmas Island Time';
        group: ['Indian/Christmas'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Christmas Island';
        countryCode: 'CX';
        mainCities: ['Flying Fish Cove'];
        rawOffsetInMinutes: 420;
        abbreviation: 'CXT';
        rawFormat: '+07:00 Christmas Island Time - Flying Fish Cove';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Christmas Island Time - Flying Fish Cove';
      },
      {
        name: 'Antarctica/Davis';
        alternativeName: 'Davis Time';
        group: ['Antarctica/Davis'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['Davis'];
        rawOffsetInMinutes: 420;
        abbreviation: 'DAVT';
        rawFormat: '+07:00 Davis Time - Davis';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Davis Time - Davis';
      },
      {
        name: 'Asia/Hovd';
        alternativeName: 'Hovd Time';
        group: ['Asia/Hovd'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Mongolia';
        countryCode: 'MN';
        mainCities: ['Ulaangom', 'Khovd', 'Ölgii', 'Altai'];
        rawOffsetInMinutes: 420;
        abbreviation: 'HOVT';
        rawFormat: '+07:00 Hovd Time - Ulaangom, Khovd, Ölgii, Altai';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Hovd Time - Ulaangom, Khovd, Ölgii, Altai';
      },
      {
        name: 'Asia/Bangkok';
        alternativeName: 'Indochina Time';
        group: ['Asia/Bangkok'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Thailand';
        countryCode: 'TH';
        mainCities: ['Bangkok', 'Samut Prakan', 'Mueang Nonthaburi', 'Udon Thani'];
        rawOffsetInMinutes: 420;
        abbreviation: 'ICT';
        rawFormat: '+07:00 Indochina Time - Bangkok, Samut Prakan, Mueang Nonthaburi, Udon Thani';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Indochina Time - Bangkok, Samut Prakan, Mueang Nonthaburi, Udon Thani';
      },
      {
        name: 'Asia/Ho_Chi_Minh';
        alternativeName: 'Indochina Time';
        group: ['Asia/Ho_Chi_Minh', 'Asia/Saigon'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Vietnam';
        countryCode: 'VN';
        mainCities: ['Ho Chi Minh City', 'Da Nang', 'Biên Hòa', 'Cần Thơ'];
        rawOffsetInMinutes: 420;
        abbreviation: 'ICT';
        rawFormat: '+07:00 Indochina Time - Ho Chi Minh City, Da Nang, Biên Hòa, Cần Thơ';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Indochina Time - Ho Chi Minh City, Da Nang, Biên Hòa, Cần Thơ';
      },
      {
        name: 'Asia/Phnom_Penh';
        alternativeName: 'Indochina Time';
        group: ['Asia/Phnom_Penh'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Cambodia';
        countryCode: 'KH';
        mainCities: ['Phnom Penh', 'Takeo', 'Siem Reap', 'Battambang'];
        rawOffsetInMinutes: 420;
        abbreviation: 'ICT';
        rawFormat: '+07:00 Indochina Time - Phnom Penh, Takeo, Siem Reap, Battambang';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Indochina Time - Phnom Penh, Takeo, Siem Reap, Battambang';
      },
      {
        name: 'Asia/Vientiane';
        alternativeName: 'Indochina Time';
        group: ['Asia/Vientiane'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Laos';
        countryCode: 'LA';
        mainCities: ['Vientiane', 'Savannakhet', 'Pakse', 'Thakhèk'];
        rawOffsetInMinutes: 420;
        abbreviation: 'ICT';
        rawFormat: '+07:00 Indochina Time - Vientiane, Savannakhet, Pakse, Thakhèk';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Indochina Time - Vientiane, Savannakhet, Pakse, Thakhèk';
      },
      {
        name: 'Asia/Novosibirsk';
        alternativeName: 'Novosibirsk Time';
        group: ['Asia/Barnaul', 'Asia/Krasnoyarsk', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Tomsk'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Novosibirsk', 'Krasnoyarsk', 'Barnaul', 'Tomsk'];
        rawOffsetInMinutes: 420;
        abbreviation: 'NOVT';
        rawFormat: '+07:00 Novosibirsk Time - Novosibirsk, Krasnoyarsk, Barnaul, Tomsk';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Novosibirsk Time - Novosibirsk, Krasnoyarsk, Barnaul, Tomsk';
      },
      {
        name: 'Asia/Jakarta';
        alternativeName: 'Western Indonesia Time';
        group: ['Asia/Jakarta', 'Asia/Pontianak'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Indonesia';
        countryCode: 'ID';
        mainCities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'];
        rawOffsetInMinutes: 420;
        abbreviation: 'WIB';
        rawFormat: '+07:00 Western Indonesia Time - Jakarta, Surabaya, Bandung, Medan';
        currentTimeOffsetInMinutes: 420;
        currentTimeFormat: '+07:00 Western Indonesia Time - Jakarta, Surabaya, Bandung, Medan';
      },
      {
        name: 'Australia/Perth';
        alternativeName: 'Australian Western Time';
        group: ['Australia/Perth', 'Australia/West'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Australia';
        countryCode: 'AU';
        mainCities: ['Perth', 'Rockingham', 'Mandurah', 'Bunbury'];
        rawOffsetInMinutes: 480;
        abbreviation: 'AWST';
        rawFormat: '+08:00 Australian Western Time - Perth, Rockingham, Mandurah, Bunbury';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Australian Western Time - Perth, Rockingham, Mandurah, Bunbury';
      },
      {
        name: 'Asia/Brunei';
        alternativeName: 'Brunei Darussalam Time';
        group: ['Asia/Brunei'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Brunei';
        countryCode: 'BN';
        mainCities: ['Bandar Seri Begawan', 'Kuala Belait', 'Seria', 'Tutong'];
        rawOffsetInMinutes: 480;
        abbreviation: 'BNT';
        rawFormat: '+08:00 Brunei Darussalam Time - Bandar Seri Begawan, Kuala Belait, Seria, Tutong';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Brunei Darussalam Time - Bandar Seri Begawan, Kuala Belait, Seria, Tutong';
      },
      {
        name: 'Asia/Makassar';
        alternativeName: 'Central Indonesia Time';
        group: ['Asia/Makassar', 'Asia/Ujung_Pandang'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Indonesia';
        countryCode: 'ID';
        mainCities: ['Makassar', 'Denpasar', 'Samarinda', 'Banjarmasin'];
        rawOffsetInMinutes: 480;
        abbreviation: 'WITA';
        rawFormat: '+08:00 Central Indonesia Time - Makassar, Denpasar, Samarinda, Banjarmasin';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Central Indonesia Time - Makassar, Denpasar, Samarinda, Banjarmasin';
      },
      {
        name: 'Asia/Macau';
        alternativeName: 'China Time';
        group: ['Asia/Macau', 'Asia/Macao'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Macao';
        countryCode: 'MO';
        mainCities: ['Macau'];
        rawOffsetInMinutes: 480;
        abbreviation: 'CST';
        rawFormat: '+08:00 China Time - Macau';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 China Time - Macau';
      },
      {
        name: 'Asia/Shanghai';
        alternativeName: 'China Time';
        group: ['Asia/Shanghai', 'Asia/Chongqing', 'Asia/Chungking', 'Asia/Harbin', 'PRC'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'China';
        countryCode: 'CN';
        mainCities: ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou'];
        rawOffsetInMinutes: 480;
        abbreviation: 'CST';
        rawFormat: '+08:00 China Time - Shanghai, Beijing, Shenzhen, Guangzhou';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 China Time - Shanghai, Beijing, Shenzhen, Guangzhou';
      },
      {
        name: 'Asia/Hong_Kong';
        alternativeName: 'Hong Kong Time';
        group: ['Asia/Hong_Kong', 'Hongkong'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Hong Kong';
        countryCode: 'HK';
        mainCities: ['Hong Kong', 'Kowloon', 'Victoria', 'Tuen Mun'];
        rawOffsetInMinutes: 480;
        abbreviation: 'HKT';
        rawFormat: '+08:00 Hong Kong Time - Hong Kong, Kowloon, Victoria, Tuen Mun';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Hong Kong Time - Hong Kong, Kowloon, Victoria, Tuen Mun';
      },
      {
        name: 'Asia/Irkutsk';
        alternativeName: 'Irkutsk Time';
        group: ['Asia/Irkutsk'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Irkutsk', 'Ulan-Ude', 'Bratsk', 'Angarsk'];
        rawOffsetInMinutes: 480;
        abbreviation: 'IRKT';
        rawFormat: '+08:00 Irkutsk Time - Irkutsk, Ulan-Ude, Bratsk, Angarsk';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Irkutsk Time - Irkutsk, Ulan-Ude, Bratsk, Angarsk';
      },
      {
        name: 'Asia/Kuala_Lumpur';
        alternativeName: 'Malaysia Time';
        group: ['Asia/Kuala_Lumpur', 'Asia/Kuching'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Malaysia';
        countryCode: 'MY';
        mainCities: ['Johor Bahru', 'Kota Bharu', 'Kuala Lumpur', 'Petaling Jaya'];
        rawOffsetInMinutes: 480;
        abbreviation: 'MYT';
        rawFormat: '+08:00 Malaysia Time - Johor Bahru, Kota Bharu, Kuala Lumpur, Petaling Jaya';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Malaysia Time - Johor Bahru, Kota Bharu, Kuala Lumpur, Petaling Jaya';
      },
      {
        name: 'Asia/Manila';
        alternativeName: 'Philippine Time';
        group: ['Asia/Manila'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Philippines';
        countryCode: 'PH';
        mainCities: ['Quezon City', 'Davao', 'Manila', 'Caloocan City'];
        rawOffsetInMinutes: 480;
        abbreviation: 'PHT';
        rawFormat: '+08:00 Philippine Time - Quezon City, Davao, Manila, Caloocan City';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Philippine Time - Quezon City, Davao, Manila, Caloocan City';
      },
      {
        name: 'Asia/Singapore';
        alternativeName: 'Singapore Time';
        group: ['Asia/Singapore', 'Singapore'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Singapore';
        countryCode: 'SG';
        mainCities: ['Singapore', 'Woodlands', 'Geylang', 'Marine Parade'];
        rawOffsetInMinutes: 480;
        abbreviation: 'SGT';
        rawFormat: '+08:00 Singapore Time - Singapore, Woodlands, Geylang, Marine Parade';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Singapore Time - Singapore, Woodlands, Geylang, Marine Parade';
      },
      {
        name: 'Asia/Taipei';
        alternativeName: 'Taipei Time';
        group: ['Asia/Taipei', 'ROC'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Taiwan';
        countryCode: 'TW';
        mainCities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan'];
        rawOffsetInMinutes: 480;
        abbreviation: 'TWT';
        rawFormat: '+08:00 Taipei Time - Taipei, Kaohsiung, Taichung, Tainan';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Taipei Time - Taipei, Kaohsiung, Taichung, Tainan';
      },
      {
        name: 'Asia/Ulaanbaatar';
        alternativeName: 'Ulaanbaatar Time';
        group: ['Asia/Choibalsan', 'Asia/Ulaanbaatar', 'Asia/Ulan_Bator'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Mongolia';
        countryCode: 'MN';
        mainCities: ['Ulan Bator', 'Erdenet', 'Darhan', 'Mörön'];
        rawOffsetInMinutes: 480;
        abbreviation: 'ULAT';
        rawFormat: '+08:00 Ulaanbaatar Time - Ulan Bator, Erdenet, Darhan, Mörön';
        currentTimeOffsetInMinutes: 480;
        currentTimeFormat: '+08:00 Ulaanbaatar Time - Ulan Bator, Erdenet, Darhan, Mörön';
      },
      {
        name: 'Australia/Eucla';
        alternativeName: 'Australian Central Western Time';
        group: ['Australia/Eucla'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Australia';
        countryCode: 'AU';
        mainCities: ['Eucla'];
        rawOffsetInMinutes: 525;
        abbreviation: 'ACWST';
        rawFormat: '+08:45 Australian Central Western Time - Eucla';
        currentTimeOffsetInMinutes: 525;
        currentTimeFormat: '+08:45 Australian Central Western Time - Eucla';
      },
      {
        name: 'Asia/Dili';
        alternativeName: 'East Timor Time';
        group: ['Asia/Dili'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Timor Leste';
        countryCode: 'TL';
        mainCities: ['Dili', 'Maliana', 'Suai', 'Likisá'];
        rawOffsetInMinutes: 540;
        abbreviation: 'TLT';
        rawFormat: '+09:00 East Timor Time - Dili, Maliana, Suai, Likisá';
        currentTimeOffsetInMinutes: 540;
        currentTimeFormat: '+09:00 East Timor Time - Dili, Maliana, Suai, Likisá';
      },
      {
        name: 'Asia/Jayapura';
        alternativeName: 'Eastern Indonesia Time';
        group: ['Asia/Jayapura'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Indonesia';
        countryCode: 'ID';
        mainCities: ['Jayapura', 'Ambon', 'Sorong', 'Ternate'];
        rawOffsetInMinutes: 540;
        abbreviation: 'WIT';
        rawFormat: '+09:00 Eastern Indonesia Time - Jayapura, Ambon, Sorong, Ternate';
        currentTimeOffsetInMinutes: 540;
        currentTimeFormat: '+09:00 Eastern Indonesia Time - Jayapura, Ambon, Sorong, Ternate';
      },
      {
        name: 'Asia/Tokyo';
        alternativeName: 'Japan Time';
        group: ['Asia/Tokyo', 'Japan'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'Japan';
        countryCode: 'JP';
        mainCities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya'];
        rawOffsetInMinutes: 540;
        abbreviation: 'JST';
        rawFormat: '+09:00 Japan Time - Tokyo, Yokohama, Osaka, Nagoya';
        currentTimeOffsetInMinutes: 540;
        currentTimeFormat: '+09:00 Japan Time - Tokyo, Yokohama, Osaka, Nagoya';
      },
      {
        name: 'Asia/Pyongyang';
        alternativeName: 'Korean Time';
        group: ['Asia/Pyongyang'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'North Korea';
        countryCode: 'KP';
        mainCities: ['Pyongyang', 'Hamhŭng', 'Namp’o', 'Sunch’ŏn'];
        rawOffsetInMinutes: 540;
        abbreviation: 'KST';
        rawFormat: '+09:00 Korean Time - Pyongyang, Hamhŭng, Namp’o, Sunch’ŏn';
        currentTimeOffsetInMinutes: 540;
        currentTimeFormat: '+09:00 Korean Time - Pyongyang, Hamhŭng, Namp’o, Sunch’ŏn';
      },
      {
        name: 'Asia/Seoul';
        alternativeName: 'Korean Time';
        group: ['Asia/Seoul', 'ROK'];
        continentCode: 'AS';
        continentName: 'Asia';
        countryName: 'South Korea';
        countryCode: 'KR';
        mainCities: ['Seoul', 'Busan', 'Incheon', 'Daegu'];
        rawOffsetInMinutes: 540;
        abbreviation: 'KST';
        rawFormat: '+09:00 Korean Time - Seoul, Busan, Incheon, Daegu';
        currentTimeOffsetInMinutes: 540;
        currentTimeFormat: '+09:00 Korean Time - Seoul, Busan, Incheon, Daegu';
      },
      {
        name: 'Pacific/Palau';
        alternativeName: 'Palau Time';
        group: ['Pacific/Palau'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Palau';
        countryCode: 'PW';
        mainCities: ['Ngerulmud'];
        rawOffsetInMinutes: 540;
        abbreviation: 'PWT';
        rawFormat: '+09:00 Palau Time - Ngerulmud';
        currentTimeOffsetInMinutes: 540;
        currentTimeFormat: '+09:00 Palau Time - Ngerulmud';
      },
      {
        name: 'Asia/Chita';
        alternativeName: 'Yakutsk Time';
        group: ['Asia/Chita', 'Asia/Khandyga', 'Asia/Yakutsk'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Chita', 'Yakutsk', 'Blagoveshchensk', 'Belogorsk'];
        rawOffsetInMinutes: 540;
        abbreviation: 'YAKT';
        rawFormat: '+09:00 Yakutsk Time - Chita, Yakutsk, Blagoveshchensk, Belogorsk';
        currentTimeOffsetInMinutes: 540;
        currentTimeFormat: '+09:00 Yakutsk Time - Chita, Yakutsk, Blagoveshchensk, Belogorsk';
      },
      {
        name: 'Australia/Darwin';
        alternativeName: 'Australian Central Time';
        group: ['Australia/Darwin', 'Australia/North'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Australia';
        countryCode: 'AU';
        mainCities: ['Darwin', 'Alice Springs', 'Palmerston'];
        rawOffsetInMinutes: 570;
        abbreviation: 'ACST';
        rawFormat: '+09:30 Australian Central Time - Darwin, Alice Springs, Palmerston';
        currentTimeOffsetInMinutes: 570;
        currentTimeFormat: '+09:30 Australian Central Time - Darwin, Alice Springs, Palmerston';
      },
      {
        name: 'Australia/Brisbane';
        alternativeName: 'Australian Eastern Time';
        group: ['Australia/Brisbane', 'Australia/Lindeman', 'Australia/Queensland'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Australia';
        countryCode: 'AU';
        mainCities: ['Brisbane', 'Gold Coast', 'Logan City', 'Townsville'];
        rawOffsetInMinutes: 600;
        abbreviation: 'AEST';
        rawFormat: '+10:00 Australian Eastern Time - Brisbane, Gold Coast, Logan City, Townsville';
        currentTimeOffsetInMinutes: 600;
        currentTimeFormat: '+10:00 Australian Eastern Time - Brisbane, Gold Coast, Logan City, Townsville';
      },
      {
        name: 'Pacific/Guam';
        alternativeName: 'Chamorro Time';
        group: ['Pacific/Guam'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Guam';
        countryCode: 'GU';
        mainCities: ['Dededo Village', 'Yigo Village', 'Tamuning-Tumon-Harmon Village', 'Tamuning'];
        rawOffsetInMinutes: 600;
        abbreviation: 'ChST';
        rawFormat: '+10:00 Chamorro Time - Dededo Village, Yigo Village, Tamuning-Tumon-Harmon Village, Tamuning';
        currentTimeOffsetInMinutes: 600;
        currentTimeFormat: '+10:00 Chamorro Time - Dededo Village, Yigo Village, Tamuning-Tumon-Harmon Village, Tamuning';
      },
      {
        name: 'Pacific/Saipan';
        alternativeName: 'Chamorro Time';
        group: ['Pacific/Saipan'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Northern Mariana Islands';
        countryCode: 'MP';
        mainCities: ['Saipan'];
        rawOffsetInMinutes: 600;
        abbreviation: 'ChST';
        rawFormat: '+10:00 Chamorro Time - Saipan';
        currentTimeOffsetInMinutes: 600;
        currentTimeFormat: '+10:00 Chamorro Time - Saipan';
      },
      {
        name: 'Pacific/Chuuk';
        alternativeName: 'Chuuk Time';
        group: ['Pacific/Chuuk', 'Pacific/Truk', 'Pacific/Yap'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Micronesia';
        countryCode: 'FM';
        mainCities: ['Chuuk'];
        rawOffsetInMinutes: 600;
        abbreviation: 'CHUT';
        rawFormat: '+10:00 Chuuk Time - Chuuk';
        currentTimeOffsetInMinutes: 600;
        currentTimeFormat: '+10:00 Chuuk Time - Chuuk';
      },
      {
        name: 'Antarctica/DumontDUrville';
        alternativeName: 'Dumont-d’Urville Time';
        group: ['Antarctica/DumontDUrville'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['DumontDUrville'];
        rawOffsetInMinutes: 600;
        abbreviation: 'DDUT';
        rawFormat: '+10:00 Dumont-d’Urville Time - DumontDUrville';
        currentTimeOffsetInMinutes: 600;
        currentTimeFormat: '+10:00 Dumont-d’Urville Time - DumontDUrville';
      },
      {
        name: 'Pacific/Port_Moresby';
        alternativeName: 'Papua New Guinea Time';
        group: ['Pacific/Port_Moresby', 'Pacific/Truk', 'Pacific/Yap'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Papua New Guinea';
        countryCode: 'PG';
        mainCities: ['Port Moresby', 'Lae', 'Mount Hagen', 'Popondetta'];
        rawOffsetInMinutes: 600;
        abbreviation: 'PGT';
        rawFormat: '+10:00 Papua New Guinea Time - Port Moresby, Lae, Mount Hagen, Popondetta';
        currentTimeOffsetInMinutes: 600;
        currentTimeFormat: '+10:00 Papua New Guinea Time - Port Moresby, Lae, Mount Hagen, Popondetta';
      },
      {
        name: 'Asia/Vladivostok';
        alternativeName: 'Vladivostok Time';
        group: ['Asia/Ust-Nera', 'Asia/Vladivostok'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Khabarovsk', 'Vladivostok', 'Khabarovsk Vtoroy', 'Komsomolsk-on-Amur'];
        rawOffsetInMinutes: 600;
        abbreviation: 'VLAT';
        rawFormat: '+10:00 Vladivostok Time - Khabarovsk, Vladivostok, Khabarovsk Vtoroy, Komsomolsk-on-Amur';
        currentTimeOffsetInMinutes: 600;
        currentTimeFormat: '+10:00 Vladivostok Time - Khabarovsk, Vladivostok, Khabarovsk Vtoroy, Komsomolsk-on-Amur';
      },
      {
        name: 'Australia/Adelaide';
        alternativeName: 'Australian Central Time';
        group: ['Australia/Adelaide', 'Australia/Broken_Hill', 'Australia/South', 'Australia/Yancowinna'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Australia';
        countryCode: 'AU';
        mainCities: ['Adelaide', 'Adelaide Hills', 'Mount Gambier', 'Morphett Vale'];
        rawOffsetInMinutes: 570;
        abbreviation: 'ACST';
        rawFormat: '+09:30 Australian Central Time - Adelaide, Adelaide Hills, Mount Gambier, Morphett Vale';
        currentTimeOffsetInMinutes: 630;
        currentTimeFormat: '+10:30 Australian Central Time - Adelaide, Adelaide Hills, Mount Gambier, Morphett Vale';
      },
      {
        name: 'Australia/Sydney';
        alternativeName: 'Australian Eastern Time';
        group: [
          'Antarctica/Macquarie',
          'Australia/Hobart',
          'Australia/Melbourne',
          'Australia/Sydney',
          'Australia/Currie',
          'Australia/Tasmania',
          'Australia/Victoria',
          'Australia/ACT',
          'Australia/Canberra',
          'Australia/NSW'
        ];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Australia';
        countryCode: 'AU';
        mainCities: ['Sydney', 'Melbourne', 'Canberra', 'Newcastle'];
        rawOffsetInMinutes: 600;
        abbreviation: 'AEST';
        rawFormat: '+10:00 Australian Eastern Time - Sydney, Melbourne, Canberra, Newcastle';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Australian Eastern Time - Sydney, Melbourne, Canberra, Newcastle';
      },
      {
        name: 'Pacific/Bougainville';
        alternativeName: 'Bougainville Time';
        group: ['Pacific/Bougainville'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Papua New Guinea';
        countryCode: 'PG';
        mainCities: ['Arawa'];
        rawOffsetInMinutes: 660;
        abbreviation: 'BST';
        rawFormat: '+11:00 Bougainville Time - Arawa';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Bougainville Time - Arawa';
      },
      {
        name: 'Antarctica/Casey';
        alternativeName: 'Casey Time';
        group: ['Antarctica/Casey'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['Casey'];
        rawOffsetInMinutes: 660;
        abbreviation: 'CAST';
        rawFormat: '+11:00 Casey Time - Casey';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Casey Time - Casey';
      },
      {
        name: 'Pacific/Kosrae';
        alternativeName: 'Kosrae Time';
        group: ['Pacific/Kosrae', 'Pacific/Pohnpei'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Micronesia';
        countryCode: 'FM';
        mainCities: ['Kosrae', 'Palikir - National Government Center'];
        rawOffsetInMinutes: 660;
        abbreviation: 'KOST';
        rawFormat: '+11:00 Kosrae Time - Kosrae, Palikir - National Government Center';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Kosrae Time - Kosrae, Palikir - National Government Center';
      },
      {
        name: 'Australia/Lord_Howe';
        alternativeName: 'Lord Howe Time';
        group: ['Australia/Lord_Howe', 'Australia/LHI'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Australia';
        countryCode: 'AU';
        mainCities: ['Lord Howe'];
        rawOffsetInMinutes: 630;
        abbreviation: 'LHST';
        rawFormat: '+10:30 Lord Howe Time - Lord Howe';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Lord Howe Time - Lord Howe';
      },
      {
        name: 'Pacific/Noumea';
        alternativeName: 'New Caledonia Time';
        group: ['Pacific/Noumea'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'New Caledonia';
        countryCode: 'NC';
        mainCities: ['Nouméa', 'Mont-Dore', 'Dumbéa'];
        rawOffsetInMinutes: 660;
        abbreviation: 'NCT';
        rawFormat: '+11:00 New Caledonia Time - Nouméa, Mont-Dore, Dumbéa';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 New Caledonia Time - Nouméa, Mont-Dore, Dumbéa';
      },
      {
        name: 'Asia/Sakhalin';
        alternativeName: 'Sakhalin Time';
        group: ['Asia/Magadan', 'Asia/Sakhalin', 'Asia/Srednekolymsk'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Yuzhno-Sakhalinsk', 'Magadan', 'Korsakov', 'Kholmsk'];
        rawOffsetInMinutes: 660;
        abbreviation: 'SAKT';
        rawFormat: '+11:00 Sakhalin Time - Yuzhno-Sakhalinsk, Magadan, Korsakov, Kholmsk';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Sakhalin Time - Yuzhno-Sakhalinsk, Magadan, Korsakov, Kholmsk';
      },
      {
        name: 'Pacific/Guadalcanal';
        alternativeName: 'Solomon Islands Time';
        group: ['Pacific/Guadalcanal', 'Pacific/Ponape'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Solomon Islands';
        countryCode: 'SB';
        mainCities: ['Honiara'];
        rawOffsetInMinutes: 660;
        abbreviation: 'SBT';
        rawFormat: '+11:00 Solomon Islands Time - Honiara';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Solomon Islands Time - Honiara';
      },
      {
        name: 'Pacific/Efate';
        alternativeName: 'Vanuatu Time';
        group: ['Pacific/Efate'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Vanuatu';
        countryCode: 'VU';
        mainCities: ['Port-Vila'];
        rawOffsetInMinutes: 660;
        abbreviation: 'VUT';
        rawFormat: '+11:00 Vanuatu Time - Port-Vila';
        currentTimeOffsetInMinutes: 660;
        currentTimeFormat: '+11:00 Vanuatu Time - Port-Vila';
      },
      {
        name: 'Pacific/Fiji';
        alternativeName: 'Fiji Time';
        group: ['Pacific/Fiji'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Fiji';
        countryCode: 'FJ';
        mainCities: ['Suva', 'Lautoka', 'Nadi', 'Labasa'];
        rawOffsetInMinutes: 720;
        abbreviation: 'FJT';
        rawFormat: '+12:00 Fiji Time - Suva, Lautoka, Nadi, Labasa';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Fiji Time - Suva, Lautoka, Nadi, Labasa';
      },
      {
        name: 'Pacific/Tarawa';
        alternativeName: 'Gilbert Islands Time';
        group: ['Pacific/Tarawa'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Kiribati';
        countryCode: 'KI';
        mainCities: ['Tarawa'];
        rawOffsetInMinutes: 720;
        abbreviation: 'GILT';
        rawFormat: '+12:00 Gilbert Islands Time - Tarawa';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Gilbert Islands Time - Tarawa';
      },
      {
        name: 'Pacific/Majuro';
        alternativeName: 'Marshall Islands Time';
        group: ['Pacific/Kwajalein', 'Pacific/Majuro', 'Kwajalein'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Marshall Islands';
        countryCode: 'MH';
        mainCities: ['Majuro', 'Kwajalein', 'RMI Capitol'];
        rawOffsetInMinutes: 720;
        abbreviation: 'MHT';
        rawFormat: '+12:00 Marshall Islands Time - Majuro, Kwajalein, RMI Capitol';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Marshall Islands Time - Majuro, Kwajalein, RMI Capitol';
      },
      {
        name: 'Pacific/Nauru';
        alternativeName: 'Nauru Time';
        group: ['Pacific/Nauru'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Nauru';
        countryCode: 'NR';
        mainCities: ['Yaren'];
        rawOffsetInMinutes: 720;
        abbreviation: 'NRT';
        rawFormat: '+12:00 Nauru Time - Yaren';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Nauru Time - Yaren';
      },
      {
        name: 'Pacific/Norfolk';
        alternativeName: 'Norfolk Island Time';
        group: ['Pacific/Norfolk'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Norfolk Island';
        countryCode: 'NF';
        mainCities: ['Kingston'];
        rawOffsetInMinutes: 660;
        abbreviation: 'NFT';
        rawFormat: '+11:00 Norfolk Island Time - Kingston';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Norfolk Island Time - Kingston';
      },
      {
        name: 'Asia/Kamchatka';
        alternativeName: 'Petropavlovsk-Kamchatski Time';
        group: ['Asia/Anadyr', 'Asia/Kamchatka'];
        continentCode: 'EU';
        continentName: 'Europe';
        countryName: 'Russia';
        countryCode: 'RU';
        mainCities: ['Petropavlovsk-Kamchatsky', 'Yelizovo', 'Vilyuchinsk', 'Anadyr'];
        rawOffsetInMinutes: 720;
        abbreviation: 'PETT';
        rawFormat: '+12:00 Petropavlovsk-Kamchatski Time - Petropavlovsk-Kamchatsky, Yelizovo, Vilyuchinsk, Anadyr';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Petropavlovsk-Kamchatski Time - Petropavlovsk-Kamchatsky, Yelizovo, Vilyuchinsk, Anadyr';
      },
      {
        name: 'Pacific/Funafuti';
        alternativeName: 'Tuvalu Time';
        group: ['Pacific/Funafuti'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Tuvalu';
        countryCode: 'TV';
        mainCities: ['Funafuti'];
        rawOffsetInMinutes: 720;
        abbreviation: 'TVT';
        rawFormat: '+12:00 Tuvalu Time - Funafuti';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Tuvalu Time - Funafuti';
      },
      {
        name: 'Pacific/Wake';
        alternativeName: 'Wake Island Time';
        group: ['Pacific/Wake'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'United States Minor Outlying Islands';
        countryCode: 'UM';
        mainCities: ['Wake'];
        rawOffsetInMinutes: 720;
        abbreviation: 'WAKT';
        rawFormat: '+12:00 Wake Island Time - Wake';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Wake Island Time - Wake';
      },
      {
        name: 'Pacific/Wallis';
        alternativeName: 'Wallis & Futuna Time';
        group: ['Pacific/Wallis'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Wallis and Futuna';
        countryCode: 'WF';
        mainCities: ['Mata-Utu'];
        rawOffsetInMinutes: 720;
        abbreviation: 'WFT';
        rawFormat: '+12:00 Wallis & Futuna Time - Mata-Utu';
        currentTimeOffsetInMinutes: 720;
        currentTimeFormat: '+12:00 Wallis & Futuna Time - Mata-Utu';
      },
      {
        name: 'Pacific/Apia';
        alternativeName: 'Apia Time';
        group: ['Pacific/Apia'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Samoa';
        countryCode: 'WS';
        mainCities: ['Apia'];
        rawOffsetInMinutes: 780;
        abbreviation: 'WST';
        rawFormat: '+13:00 Apia Time - Apia';
        currentTimeOffsetInMinutes: 780;
        currentTimeFormat: '+13:00 Apia Time - Apia';
      },
      {
        name: 'Pacific/Auckland';
        alternativeName: 'New Zealand Time';
        group: ['Pacific/Auckland', 'Antarctica/South_Pole', 'NZ'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'New Zealand';
        countryCode: 'NZ';
        mainCities: ['Auckland', 'Wellington', 'Christchurch', 'Manukau City'];
        rawOffsetInMinutes: 720;
        abbreviation: 'NZST';
        rawFormat: '+12:00 New Zealand Time - Auckland, Wellington, Christchurch, Manukau City';
        currentTimeOffsetInMinutes: 780;
        currentTimeFormat: '+13:00 New Zealand Time - Auckland, Wellington, Christchurch, Manukau City';
      },
      {
        name: 'Antarctica/McMurdo';
        alternativeName: 'New Zealand Time';
        group: ['Antarctica/McMurdo'];
        continentCode: 'AN';
        continentName: 'Antarctica';
        countryName: 'Antarctica';
        countryCode: 'AQ';
        mainCities: ['McMurdo'];
        rawOffsetInMinutes: 720;
        abbreviation: 'NZST';
        rawFormat: '+12:00 New Zealand Time - McMurdo';
        currentTimeOffsetInMinutes: 780;
        currentTimeFormat: '+13:00 New Zealand Time - McMurdo';
      },
      {
        name: 'Pacific/Kanton';
        alternativeName: 'Phoenix Islands Time';
        group: ['Pacific/Kanton', 'Pacific/Enderbury'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Kiribati';
        countryCode: 'KI';
        mainCities: ['Kanton'];
        rawOffsetInMinutes: 780;
        abbreviation: 'PHOT';
        rawFormat: '+13:00 Phoenix Islands Time - Kanton';
        currentTimeOffsetInMinutes: 780;
        currentTimeFormat: '+13:00 Phoenix Islands Time - Kanton';
      },
      {
        name: 'Pacific/Fakaofo';
        alternativeName: 'Tokelau Time';
        group: ['Pacific/Fakaofo'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Tokelau';
        countryCode: 'TK';
        mainCities: ['Fakaofo'];
        rawOffsetInMinutes: 780;
        abbreviation: 'TKT';
        rawFormat: '+13:00 Tokelau Time - Fakaofo';
        currentTimeOffsetInMinutes: 780;
        currentTimeFormat: '+13:00 Tokelau Time - Fakaofo';
      },
      {
        name: 'Pacific/Tongatapu';
        alternativeName: 'Tonga Time';
        group: ['Pacific/Tongatapu'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Tonga';
        countryCode: 'TO';
        mainCities: ['Nuku‘alofa'];
        rawOffsetInMinutes: 780;
        abbreviation: 'TOT';
        rawFormat: '+13:00 Tonga Time - Nuku‘alofa';
        currentTimeOffsetInMinutes: 780;
        currentTimeFormat: '+13:00 Tonga Time - Nuku‘alofa';
      },
      {
        name: 'Pacific/Chatham';
        alternativeName: 'Chatham Time';
        group: ['Pacific/Chatham', 'NZ-CHAT'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'New Zealand';
        countryCode: 'NZ';
        mainCities: ['Chatham'];
        rawOffsetInMinutes: 765;
        abbreviation: 'CHAST';
        rawFormat: '+12:45 Chatham Time - Chatham';
        currentTimeOffsetInMinutes: 825;
        currentTimeFormat: '+13:45 Chatham Time - Chatham';
      },
      {
        name: 'Pacific/Kiritimati';
        alternativeName: 'Line Islands Time';
        group: ['Pacific/Kiritimati'];
        continentCode: 'OC';
        continentName: 'Oceania';
        countryName: 'Kiribati';
        countryCode: 'KI';
        mainCities: ['Kiritimati'];
        rawOffsetInMinutes: 840;
        abbreviation: 'LINT';
        rawFormat: '+14:00 Line Islands Time - Kiritimati';
        currentTimeOffsetInMinutes: 840;
        currentTimeFormat: '+14:00 Line Islands Time - Kiritimati';
      }
    ];
  };
  gameId: 38;
  gameName: 'Terty Tine';
  timeCreated: '2023-02-10T16:23:31.158Z';
  gameStatus: 'Registration';
  currentYear: 0;
  stylizedStartYear: 2000;
  concurrentGamesLimit: 0;
  privateGame: null;
  hiddenGame: null;
  blindAdministrators: false;
  assignmentMethod: 'manual';
  deadlineType: 'weekly';
  meridiemTime: true;
  observeDst: true;
  turn1Timing: 'standard';
  startTime: '2023-02-14T04:00:00.836Z';
  ordersDay: 'Monday';
  ordersTime: '12:00 PM';
  retreatsDay: 'Tuesday';
  retreatsTime: '12:00 PM';
  adjustmentsDay: 'Wednesday';
  adjustmentsTime: '12:00 PM';
  nominationsDay: 'Thursday';
  nominationsTime: '12:00 PM';
  votesDay: 'Friday';
  votesTime: '12:00 PM';
  nmrToleranceTotal: 3;
  nmrToleranceOrders: null;
  nmrToleranceRetreats: null;
  nmrToleranceAdjustments: null;
  voteDelayEnabled: false;
  voteDelayLock: null;
  voteDelayPercent: null;
  voteDelayCount: null;
  voteDelayDisplayPercent: null;
  voteDelayDisplayCount: null;
  partialRosterStart: false;
  finalReadinessCheck: false;
  nominationTiming: 'set';
  nominationYear: 8;
  automaticAssignments: false;
  ratingLimitsEnabled: true;
  funMin: 0;
  funMax: 100;
  skillMin: 0;
  skillMax: 100;
  isAdmin: true;
  rules: [];
  playerRegistration: [
    {
      assignmentType: 'Creator';
      assignmentEnd: null;
    }
  ];
}
