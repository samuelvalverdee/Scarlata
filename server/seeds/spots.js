// The curated spot list. This file IS the map. A pin exists because someone put it here on
// purpose, not because a user submitted it (see models/spot.js on why spots aren't
// user-owned). Adding to it is a deliberate act; treat it like content, not fixtures.
//
// Provenance:
//   - `coordinates` come from OpenStreetMap (Overpass), looked up against real OSM nodes,
//     not recalled from memory. This is the most trustworthy field in the file.
//   - `province` comes from reverse-geocoding those coordinates (Nominatim). Where the
//     geocoder disagreed with how a place is commonly described, the override is commented.
//   - Descriptions and `difficulty` are best-effort and worth a local's read.
//   - The optional numeric specs (trailLengthKm, waterfallHeightM, maxOccupancy, elevation,
//     duration) are indicative, deliberately NOT individually verified. They are display
//     detail for a frontend that doesn't exist yet. Don't trust them for planning a trip.
//
// `VERIFY:` now marks only things that would make a pin *wrong* rather than imprecise:
// contested provinces, pins sitting on a polygon centroid instead of an entrance, and access
// that may have closed. `grep -n "VERIFY:" spots.js`.
//
// `images` is empty everywhere on purpose: a fabricated photo URL is a broken image on the
// spot page, which is worse than none. Filled once Phase 5 wires Cloudinary.

module.exports = [
    // ================================================================ Alajuela
    {
        name: 'Catarata Río Celeste',
        description:
            'The waterfall in Tenorio Volcano National Park where the river turns turquoise. ' +
            'The colour is a mineral effect, not sediment, and it washes out for a while after ' +
            'heavy rain, so going the day after a downpour is how most people end up disappointed. ' +
            'The falls sit at the bottom of about 250 steps, partway along the park loop that ' +
            'also passes Los Teñideros, where the two clear rivers meet and the colour starts.',
        location: { type: 'Point', coordinates: [-84.99077, 10.70358] },
        // VERIFY: commonly described as Guanacaste; the park straddles the line and this
        // coordinate reverse-geocodes to Alajuela (Guatuso). Which would a local look under?
        province: 'Alajuela',
        activityTypes: ['waterfall', 'hiking'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        estimatedDurationHrs: 3,
        trailLengthKm: 6,
        swimmable: false,     // Swimming is prohibited park-wide, worth stating on the page
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Catarata Río Fortuna',
        description:
            'La Fortuna\'s waterfall, reached by a long staircase down a steep green gorge. ' +
            'The pool at the base is swimmable but the current directly under the fall is ' +
            'strong enough that the calmer pool downstream is where most people actually get in. ' +
            'Easy to combine with Arenal in the same day since it is minutes from town.',
        location: { type: 'Point', coordinates: [-84.66933, 10.43919] },
        province: 'Alajuela',
        activityTypes: ['waterfall'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        estimatedDurationHrs: 2,
        waterfallHeightM: 70,
        swimmable: true,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Cerro Chato',
        description:
            'The extinct cone next to Arenal, with a green crater lagoon in the top. A short ' +
            'hike by distance and a hard one by effort: relentlessly steep, and mud with any ' +
            'rain.',
        location: { type: 'Point', coordinates: [-84.68829, 10.44292] },
        province: 'Alajuela',
        activityTypes: ['hiking', 'viewpoint'],
        difficulty: 'hard',
        bestTimeOfDay: 'sunrise',
        // VERIFY: access has been restricted at points because the routes cross private land.
        // Confirm it is currently open before this pin goes live.
        trailLengthKm: 5,
        elevationGainM: 700,
        estimatedDurationHrs: 5,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Catarata del Toro',
        description:
            'A single tall drop into an old volcanic crater in Bajos del Toro, seen from a ' +
            'platform partway down a long staircase. Far greener and colder than the Guanacaste ' +
            'falls, and quiet compared to anything near La Fortuna.',
        location: { type: 'Point', coordinates: [-84.27251, 10.25344] },
        province: 'Alajuela',
        activityTypes: ['waterfall', 'hiking'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        waterfallHeightM: 90,
        swimmable: false,
        estimatedDurationHrs: 2,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Volcán Poás',
        description:
            'One of the most accessible active craters anywhere, a paved walk from the car park ' +
            'to a viewing platform above a steaming acid lake. Visits are timed and capped, and ' +
            'the park closes outright when gas readings climb, so book ahead and expect the ' +
            'possibility of being turned around. Clearest in the first hours after opening.',
        location: { type: 'Point', coordinates: [-84.23084, 10.19766] },
        province: 'Alajuela',
        activityTypes: ['viewpoint'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        estimatedDurationHrs: 2,
        elevationGainM: 0,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Mistico Arenal Hanging Bridges',
        description:
            'A loop of suspension bridges through primary forest on the north side of Arenal, ' +
            'built so you cross the canopy at its own level rather than looking up at it. Gentle ' +
            'enough to be genuinely accessible, and the reason to go early is birds and sloths ' +
            'rather than light.',
        location: { type: 'Point', coordinates: [-84.75378, 10.48805] },
        province: 'Alajuela',
        activityTypes: ['hanging-bridges', 'hiking'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        trailLengthKm: 3.2,
        estimatedDurationHrs: 3,
        permitRequired: true,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Termales gratuitas del Río Tabacón',
        description:
            'The free stretch of the Tabacón, the same volcanically heated river the resorts ' +
            'downstream charge for, where it passes under the road. No facilities, no fee, and ' +
            'no supervision: it is a riverbank, and the rocks are slick. Busiest at dusk.',
        location: { type: 'Point', coordinates: [-84.72397, 10.4886] },
        province: 'Alajuela',
        activityTypes: ['hot-springs', 'river'],
        difficulty: 'easy',
        bestTimeOfDay: 'sunset',
        estimatedDurationHrs: 2,
        swimmable: true,
        permitRequired: false,
        oneDayTrip: true,
        images: [],
    },

    // ================================================================ Guanacaste
    {
        name: 'Catarata Llanos de Cortés',
        description:
            'A wide curtain of water falling into a shallow sandy pool near Bagaces, much ' +
            'broader than it is tall, which is what makes it photograph the way it does. One of ' +
            'the few well-known falls where the swimming is genuinely easy and the beach at the ' +
            'base is big enough to spend an afternoon on.',
        location: { type: 'Point', coordinates: [-85.2986, 10.5243] },
        province: 'Guanacaste',
        activityTypes: ['waterfall'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        waterfallHeightM: 12,
        swimmable: true,
        estimatedDurationHrs: 2,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Volcán Rincón de la Vieja',
        description:
            'The active volcano above Liberia. The Las Pailas sector at the base (fumaroles, ' +
            'boiling mud pots, a short forest loop) is what stays open and what most visitors ' +
            'actually do; the summit route closes whenever activity picks up.',
        location: { type: 'Point', coordinates: [-85.33654, 10.83136] },
        // VERIFY: universally thought of as Guanacaste and the park HQ is, but this summit
        // coordinate reverse-geocodes to Alajuela (Upala) because the boundary runs over the
        // cone. Overriding the geocoder deliberately. Consider moving the pin to Las Pailas.
        province: 'Guanacaste',
        activityTypes: ['hiking', 'viewpoint'],
        difficulty: 'hard',
        bestTimeOfDay: 'morning',
        trailLengthKm: 16,
        elevationGainM: 1100,
        estimatedDurationHrs: 8,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Cerro Pelado',
        description:
            'Open grassy ridge with a long view over the Guanacaste lowlands and out toward the ' +
            'gulf, one of the spots where camping at the top for sunrise is the whole point ' +
            'rather than an afterthought.',
        location: { type: 'Point', coordinates: [-85.01713, 10.36621] },
        province: 'Guanacaste',
        activityTypes: ['hiking', 'camping', 'viewpoint'],
        // VERIFY: lowest-confidence entry in the file. OSM has two "Cerro Pelado" in Costa
        // Rica; this is the one near Cañas at ~662m. Confirm it is the one you meant in the
        // models/spot.js comment, and correct everything below if not.
        difficulty: 'moderate',
        bestTimeOfDay: 'sunrise',
        trailLengthKm: 7,
        elevationGainM: 500,
        estimatedDurationHrs: 4,
        maxOccupancy: 20,
        oneDayTrip: false,
        images: [],
    },
    {
        name: 'Parque Nacional Santa Rosa',
        description:
            'Dry tropical forest in the far northwest, a rarer ecosystem than the rainforest ' +
            'the country is known for, and one that transforms completely between seasons: bare ' +
            'and brown in the dry months, closed and green after the rains. Camping near the ' +
            'Casona is among the best-organised in the park system.',
        location: { type: 'Point', coordinates: [-85.78984, 10.82176] },
        province: 'Guanacaste',
        activityTypes: ['hiking', 'camping'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        // VERIFY: pin is the park centroid. Move it to the Santa Rosa sector entrance.
        trailLengthKm: 12,
        estimatedDurationHrs: 6,
        maxOccupancy: 60,
        permitRequired: true,
        oneDayTrip: false,
        images: [],
    },
    {
        name: 'Parque Nacional Barra Honda',
        description:
            'A limestone hill on the Nicoya peninsula, hollow with caves formed out of old reef ' +
            'rock. Descending into Terciopelo is done on a ladder with a guide, which makes this ' +
            'the least improvisable spot on the map, so arrange it in advance or you will only see ' +
            'the surface trails and the viewpoint.',
        location: { type: 'Point', coordinates: [-85.33846, 10.1818] },
        province: 'Guanacaste',
        activityTypes: ['hiking', 'viewpoint'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        trailLengthKm: 6,
        estimatedDurationHrs: 5,
        permitRequired: true,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Río Negro Hot Springs',
        description:
            'Volcanically heated pools on the Río Negro on the Rincón de la Vieja flank, reached ' +
            'over a set of small suspension bridges. Rustic and river-fed rather than built  ' +
            'the appeal is that it still feels like a river rather than a spa.',
        location: { type: 'Point', coordinates: [-85.34714, 10.73969] },
        province: 'Guanacaste',
        activityTypes: ['hot-springs', 'river'],
        difficulty: 'easy',
        bestTimeOfDay: 'anytime',
        estimatedDurationHrs: 2,
        swimmable: true,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },

    // ================================================================ Cartago
    {
        name: 'Volcán Irazú',
        description:
            'The highest volcano in the country and the one you can drive to the rim of, which ' +
            'makes it the rare spot that is genuinely accessible to anyone. Go early: the crater ' +
            'is usually clear at dawn and socked in with cloud by mid-morning. Cold and exposed ' +
            'at the top, and people badly underestimate this coming up from the Valle Central.',
        location: { type: 'Point', coordinates: [-83.84766, 9.98145] },
        province: 'Cartago',
        activityTypes: ['viewpoint'],
        difficulty: 'easy',
        bestTimeOfDay: 'sunrise',
        estimatedDurationHrs: 2,
        elevationGainM: 0,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Parque Nacional Tapantí',
        description:
            'Wet, dense cloud forest on the edge of the Talamanca range, with short river trails ' +
            'and one of the highest rainfall totals in the country. The draw is the water and the ' +
            'birds rather than a single headline feature.',
        location: { type: 'Point', coordinates: [-83.71159, 9.67642] },
        province: 'Cartago',
        activityTypes: ['hiking', 'river'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        // VERIFY: pin is the park centroid. Move it to the ranger station entrance.
        trailLengthKm: 4,
        estimatedDurationHrs: 3,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Volcán Turrialba',
        description:
            'The one that has spent years genuinely erupting: ash on cars in San José came from ' +
            'here. Access depends entirely on current activity and has been shut for long ' +
            'stretches. When it is open the approach crosses high, bare, wind-scoured ground ' +
            'that looks like nowhere else in the country.',
        location: { type: 'Point', coordinates: [-83.76315, 10.01932] },
        province: 'Cartago',
        activityTypes: ['hiking', 'viewpoint'],
        difficulty: 'hard',
        bestTimeOfDay: 'morning',
        // VERIFY: confirm the park is currently open before this pin goes live. This one
        // genuinely closes and reopens on volcanic activity.
        trailLengthKm: 8,
        elevationGainM: 600,
        estimatedDurationHrs: 5,
        permitRequired: true,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Monumento Nacional Guayabo',
        description:
            'The most significant pre-Columbian site in the country: stone causeways, mounds ' +
            'and a working aqueduct system, on the flank of Turrialba under forest. Modest ' +
            'compared to Mesoamerican ruins and worth going for exactly that reason: it is quiet, ' +
            'and the engineering is the point.',
        location: { type: 'Point', coordinates: [-83.69505, 9.97097] },
        province: 'Cartago',
        activityTypes: ['hiking'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        trailLengthKm: 2,
        estimatedDurationHrs: 2,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Termales Hacienda Orosi',
        description:
            'Hot pools in the Orosi valley, fed from the Irazú–Turrialba geothermal system and ' +
            'set against one of the greenest valleys in the Valle Central. Much closer to San ' +
            'José than the Guanacaste springs, which makes it the realistic weeknight version.',
        location: { type: 'Point', coordinates: [-83.83799, 9.77043] },
        province: 'Cartago',
        activityTypes: ['hot-springs'],
        difficulty: 'easy',
        bestTimeOfDay: 'sunset',
        estimatedDurationHrs: 3,
        swimmable: true,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Río Pacuare',
        description:
            'The whitewater run the country is known for, class III-IV through a gorge with no ' +
            'road access, which is why the scenery holds up for the whole descent. Operators ' +
            'launch from around Tres Equis outside Turrialba. Runnable most of the year, biggest ' +
            'in the wet months.',
        location: { type: 'Point', coordinates: [-83.52745, 9.88677] },
        province: 'Cartago',
        activityTypes: ['rafting', 'river'],
        difficulty: 'hard',
        bestTimeOfDay: 'morning',
        // VERIFY: a river has no single point. This pin is an OSM node on the rafted stretch,
        // NOT an access point. It should be moved to the operator put-in, which is where a
        // user actually needs to drive to.
        estimatedDurationHrs: 6,
        swimmable: false,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },

    // ================================================================ Heredia
    {
        name: 'Volcán Barva',
        description:
            'The Braulio Carrillo sector above Heredia, where the trail climbs through mossy ' +
            'cloud forest to a still crater lagoon. Much less visited than Poás or Irazú because ' +
            'you have to walk it rather than drive it, which is most of its appeal.',
        location: { type: 'Point', coordinates: [-84.10549, 10.13398] },
        province: 'Heredia',
        activityTypes: ['hiking', 'viewpoint'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        trailLengthKm: 4,
        elevationGainM: 300,
        estimatedDurationHrs: 3,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Parque Nacional Braulio Carrillo',
        description:
            'The wall of forest the highway to Limón cuts straight through: steep, wet, and ' +
            'dense enough that it reads as a single green mass at speed. The Quebrada González ' +
            'sector puts short trails right off the road, which makes it the easiest primary ' +
            'rainforest to reach from San José.',
        location: { type: 'Point', coordinates: [-84.00189, 10.24007] },
        // VERIFY: the park spans Heredia, San José and Limón; the centroid lands in Heredia
        // (Sarapiquí). Pin should move to the Quebrada González ranger station.
        province: 'Heredia',
        activityTypes: ['hiking', 'river'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        trailLengthKm: 5,
        estimatedDurationHrs: 4,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Río Sarapiquí',
        description:
            'The gentler whitewater alternative to the Pacuare, class II-III around La Virgen, ' +
            'runnable by people who have never rafted, through lowland forest with genuinely good ' +
            'wildlife off the banks. The section above La Virgen steps up for anyone who wants it.',
        location: { type: 'Point', coordinates: [-84.12797, 10.37028] },
        province: 'Heredia',
        activityTypes: ['rafting', 'river'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        estimatedDurationHrs: 4,
        swimmable: false,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },

    // ================================================================ San José
    {
        name: 'Cerro Chirripó',
        description:
            'The highest point in Costa Rica at 3,820m, and the only place in the country with ' +
            'real páramo above the treeline. Two days minimum: a long climb from San Gerardo de ' +
            'Rivas to the Crestones base lodge, then a pre-dawn push to the summit to be up there ' +
            'before the cloud. Beds at the lodge are booked through SINAC and sell out months out. ' +
            'This is not a spot you can decide on the morning of.',
        location: { type: 'Point', coordinates: [-83.48858, 9.48431] },
        province: 'San José',
        activityTypes: ['hiking', 'camping', 'viewpoint'],
        difficulty: 'hard',
        bestTimeOfDay: 'sunrise',
        trailLengthKm: 19.5,
        elevationGainM: 2500,
        estimatedDurationHrs: 12,
        maxOccupancy: 52,
        permitRequired: true,
        oneDayTrip: false,
        guidedTour: false,
        images: [],
    },
    {
        name: 'Catarata Nauyaca',
        description:
            'Two falls on the Río Barú: a tall upper drop and a wider lower one with a deep ' +
            'pool that is one of the best swims of any waterfall in the country. Reached on foot, ' +
            'on horseback, or in a 4x4 shuttle; the walk in is long and hot but not technical.',
        location: { type: 'Point', coordinates: [-83.80692, 9.25446] },
        province: 'San José',
        activityTypes: ['waterfall', 'hiking'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        trailLengthKm: 8,
        waterfallHeightM: 45,
        swimmable: true,
        estimatedDurationHrs: 5,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Parque Nacional Los Quetzales',
        description:
            'High oak and cloud forest along the Cerro de la Muerte road, and the most reliable ' +
            'place in the country to actually see a resplendent quetzal, best in the nesting ' +
            'months around March to June, early, near fruiting aguacatillo. Cold, and the weather ' +
            'turns fast at this altitude.',
        location: { type: 'Point', coordinates: [-83.83086, 9.58518] },
        province: 'San José',
        activityTypes: ['hiking', 'river'],
        difficulty: 'moderate',
        bestTimeOfDay: 'sunrise',
        trailLengthKm: 7,
        estimatedDurationHrs: 4,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },

    // ================================================================ Puntarenas
    {
        name: 'Reserva Biológica Bosque Nuboso Monteverde',
        description:
            'The cloud forest reserve on the continental divide. Suspended bridges put you up in ' +
            'the canopy where the epiphytes and the birds actually are, and the trails below are ' +
            'gentle and well built. It rains sideways here most afternoons, and that is the ' +
            'ecosystem working, not bad luck.',
        location: { type: 'Point', coordinates: [-84.78771, 10.30345] },
        province: 'Puntarenas',
        activityTypes: ['hiking', 'hanging-bridges'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        trailLengthKm: 6,
        estimatedDurationHrs: 4,
        permitRequired: true,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Parque Nacional Manuel Antonio',
        description:
            'Small, busy, and still worth it: rainforest running straight down to white beaches, ' +
            'with sloths, capuchins and howlers close enough that the wildlife finds you rather ' +
            'than the other way round. Daily entry is capped and it closes one day a week; going ' +
            'at opening is the difference between a good visit and a queue.',
        location: { type: 'Point', coordinates: [-84.17723, 9.08499] },
        province: 'Puntarenas',
        activityTypes: ['hiking', 'snorkeling'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        // VERIFY: pin is the park centroid. Move it to the main entrance on the Quepos road.
        trailLengthKm: 5,
        swimmable: true,
        estimatedDurationHrs: 4,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Parque Nacional Corcovado',
        description:
            'The most biologically intense place in the country and the hardest to reach: ' +
            'lowland primary rainforest on the Osa, with tapirs, all four monkey species and one ' +
            'of the few viable jaguar populations left. Entry requires a certified guide and ' +
            'ranger-station bookings made well in advance; the Sirena sector is reached on foot ' +
            'or by boat, not by road.',
        location: { type: 'Point', coordinates: [-83.57411, 8.54532] },
        province: 'Puntarenas',
        activityTypes: ['hiking', 'camping'],
        difficulty: 'hard',
        bestTimeOfDay: 'sunrise',
        // VERIFY: centroid pin. Should probably be the Sirena or La Leona station. For this
        // park in particular, "which entrance" changes the entire trip.
        trailLengthKm: 20,
        estimatedDurationHrs: 10,
        maxOccupancy: 40,
        permitRequired: true,
        guidedTour: true,
        oneDayTrip: false,
        images: [],
    },
    {
        name: 'Parque Nacional Marino Ballena',
        description:
            'The sandbar off Uvita that forms a whale\'s tail at low tide, and the shape is real and ' +
            'you can walk out onto it, but only on the right tide, so this is a spot where timing ' +
            'is the entire plan. Humpbacks pass through on two separate migrations, which gives ' +
            'the park an unusually long whale season.',
        location: { type: 'Point', coordinates: [-83.73429, 9.13051] },
        province: 'Puntarenas',
        activityTypes: ['snorkeling', 'hiking'],
        difficulty: 'easy',
        bestTimeOfDay: 'anytime',   // Governed by the tide table, not the clock
        swimmable: true,
        estimatedDurationHrs: 3,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Catarata Uvita',
        description:
            'A short fall just inland from Uvita with a smooth rock chute people slide down into ' +
            'the pool. Small, easy to reach, and much more a swimming hole than a hike, so it is the ' +
            'natural pairing with Marino Ballena on the same day.',
        location: { type: 'Point', coordinates: [-83.73034, 9.17689] },
        province: 'Puntarenas',
        activityTypes: ['waterfall'],
        difficulty: 'easy',
        bestTimeOfDay: 'anytime',
        waterfallHeightM: 8,
        swimmable: true,
        estimatedDurationHrs: 2,
        oneDayTrip: true,
        images: [],
    },
    {
        name: '100% Aventura Monteverde',
        description:
            'The canopy tour above the Monteverde cloud forest, including one of the longest ' +
            'single zipline runs in Latin America and a Tarzan swing out over a gully. Weather ' +
            'here is its own decision-maker: the same wind that feeds the cloud forest is what ' +
            'grounds the lines.',
        location: { type: 'Point', coordinates: [-84.8287, 10.3433] },
        // Reverse-geocodes to Guanacaste (Tilarán) because the coordinate sits near the
        // canton line, but Monteverde is a canton of Puntarenas, so the geocoder is overridden
        // here. Businesses are welcome as spots; this one just needs a periodic check that it
        // is still trading, which a waterfall never does.
        province: 'Puntarenas',
        activityTypes: ['zipline', 'hanging-bridges'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        estimatedDurationHrs: 3,
        permitRequired: true,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },

    // ================================================================ Limón
    {
        name: 'Parque Nacional Cahuita',
        description:
            'A flat coastal trail running between the sea and the forest, with the country\'s ' +
            'most accessible living coral reef just offshore. Snorkelling is guided-only over the ' +
            'reef itself. Entry at the Kelly Creek end is by donation, which makes it one of the ' +
            'cheapest national parks to visit.',
        location: { type: 'Point', coordinates: [-82.73384, 9.78078] },
        province: 'Limón',
        activityTypes: ['snorkeling', 'hiking'],
        difficulty: 'easy',
        bestTimeOfDay: 'morning',
        // VERIFY: pin is the park centroid. Move it to the Kelly Creek entrance in Cahuita town.
        trailLengthKm: 8,
        swimmable: true,
        estimatedDurationHrs: 5,
        guidedTour: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Parque Nacional Tortuguero',
        description:
            'A network of freshwater canals behind the Caribbean beach, with no road in, so you ' +
            'arrive by boat or small plane, and you get around the same way. The green turtle ' +
            'nesting arribada from roughly July to October is the headline, but the canals ' +
            'themselves are the reason to stay: caimans, river otters, and three kinds of monkey ' +
            'from a paddled canoe at dawn.',
        location: { type: 'Point', coordinates: [-83.42562, 10.48735] },
        province: 'Limón',
        activityTypes: ['river', 'hiking'],
        difficulty: 'easy',
        bestTimeOfDay: 'sunrise',
        // VERIFY: centroid pin. Should be Tortuguero village, the actual arrival point.
        estimatedDurationHrs: 4,
        permitRequired: true,
        guidedTour: true,
        oneDayTrip: false,
        images: [],
    },
    {
        name: 'Refugio Nacional Gandoca-Manzanillo',
        description:
            'The stretch of Caribbean coast below Puerto Viejo where the forest runs to the ' +
            'sand, a coastal trail toward Punta Mona, calm reef-protected water for snorkelling ' +
            'off Manzanillo, and far fewer people than Cahuita. The trail past Manzanillo gets ' +
            'muddy and unclear; it is the one section here worth a guide.',
        location: { type: 'Point', coordinates: [-82.6418, 9.60323] },
        province: 'Limón',
        activityTypes: ['snorkeling', 'hiking'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        trailLengthKm: 10,
        swimmable: true,
        estimatedDurationHrs: 5,
        oneDayTrip: true,
        images: [],
    },
];
