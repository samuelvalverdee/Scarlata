// The curated spot list. This file IS the map. A pin exists because someone put it here on
// purpose, not because a user submitted it (see models/spot.js on why spots aren't
// user-owned). Adding to it is a deliberate act; treat it like content, not fixtures.
//
// Provenance:
//   - `coordinates` come from OpenStreetMap (Overpass), looked up against real OSM nodes,
//     not recalled from memory. This is the most trustworthy field in the file.
//   - `province` comes from reverse-geocoding those coordinates (Nominatim). Where the
//     geocoder disagreed with how a place is commonly described, the override is commented.
//   - Descriptions and `difficulty` are best-effort and worth a local's read. Names and
//     descriptions are in Spanish (the app is Spanish-first); enum values stay English keys.
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
            'La catarata del Parque Nacional Volcán Tenorio donde el río se vuelve turquesa. El ' +
            'color es un efecto mineral, no sedimento, y se pierde por un tiempo después de un ' +
            'aguacero fuerte, así que ir al día siguiente de una tormenta es la forma más común de ' +
            'llevarse una decepción. La caída está al fondo de unas 250 gradas, a medio camino del ' +
            'sendero circular del parque, que también pasa por Los Teñideros, donde se juntan los ' +
            'dos ríos transparentes y nace el color.',
        location: { type: 'Point', coordinates: [-84.99077, 10.70358] },
        // VERIFY: commonly described as Guanacaste; the park straddles the line and this
        // coordinate reverse-geocodes to Alajuela (Guatuso). Which would a local look under?
        province: 'Alajuela',
        activityTypes: ['waterfall', 'hiking'],
        difficulty: 'moderate',
        bestTimeOfDay: 'morning',
        estimatedDurationHrs: 3,
        trailLengthKm: 6,
        swimmable: false, // Swimming is prohibited park-wide, worth stating on the page
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Catarata Río Fortuna',
        description:
            'La catarata de La Fortuna, a la que se llega por una larga escalera que baja por un ' +
            'cañón verde y empinado. En la poza al pie de la caída se puede nadar, pero la ' +
            'corriente justo debajo es tan fuerte que casi todos terminan metiéndose en la poza ' +
            'más tranquila, río abajo. Fácil de combinar con el Arenal el mismo día, porque está a ' +
            'pocos minutos del pueblo.',
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
            'El cono extinto junto al Arenal, con una laguna verde dentro del cráter en la cima. ' +
            'Una caminata corta en distancia y dura en esfuerzo: empinada de principio a fin, y ' +
            'puro barro con cualquier lluvia.',
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
            'Una sola caída alta dentro de un antiguo cráter volcánico en Bajos del Toro, vista ' +
            'desde una plataforma a media bajada de una larga escalera. Mucho más verde y fría que ' +
            'las cataratas de Guanacaste, y tranquila comparada con cualquier sitio cerca de La ' +
            'Fortuna.',
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
            'Uno de los cráteres activos más accesibles del mundo: una caminata pavimentada desde ' +
            'el parqueo hasta un mirador sobre una laguna ácida que echa vapor. Las visitas tienen ' +
            'horario y cupo, y el parque cierra por completo cuando suben las mediciones de gases, ' +
            'así que conviene reservar con anticipación y contar con que a uno lo puedan devolver. ' +
            'Se ve más despejado en las primeras horas después de abrir.',
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
        name: 'Puentes Colgantes Místico Arenal',
        description:
            'Un circuito de puentes colgantes entre bosque primario, en el lado norte del Arenal, ' +
            'hecho para cruzar el dosel a su misma altura en lugar de verlo desde abajo. Es lo ' +
            'bastante suave como para ser accesible de verdad, y la razón para ir temprano son las ' +
            'aves y los perezosos, no la luz.',
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
            'El tramo gratuito del Tabacón, el mismo río calentado por el volcán por el que cobran ' +
            'los hoteles río abajo, justo donde pasa bajo la carretera. Sin instalaciones, sin ' +
            'entrada y sin vigilancia: es la orilla de un río, y las piedras resbalan. Se llena ' +
            'más al atardecer.',
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
            'Una cortina ancha de agua que cae en una poza poco profunda y de fondo arenoso cerca ' +
            'de Bagaces. Es mucho más ancha que alta, y por eso sale como sale en las fotos. Una ' +
            'de las pocas cataratas conocidas donde nadar es fácil de verdad, y la playita al pie ' +
            'alcanza para pasar la tarde.',
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
            'El volcán activo sobre Liberia. El sector Las Pailas, en la base (fumarolas, pailas ' +
            'de barro hirviendo y un sendero corto por el bosque), es lo que se mantiene abierto y ' +
            'lo que hace la mayoría de los visitantes; la ruta a la cima se cierra cada vez que ' +
            'aumenta la actividad.',
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
            'Una fila abierta de zacate con una vista amplia sobre las bajuras de Guanacaste y ' +
            'hacia el golfo. Es uno de esos lugares donde acampar arriba para ver el amanecer es ' +
            'el motivo del viaje y no un extra.',
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
            'Bosque seco tropical en el extremo noroeste, un ecosistema más escaso que el bosque ' +
            'lluvioso por el que se conoce al país, y que cambia por completo entre estaciones: ' +
            'pelado y café en los meses secos, cerrado y verde después de las lluvias. El área ' +
            'para acampar cerca de La Casona es de las mejor organizadas del sistema de parques.',
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
            'Un cerro de piedra caliza en la península de Nicoya, hueco por dentro, con cavernas ' +
            'formadas en la roca de un antiguo arrecife. El descenso a La Terciopelo se hace por ' +
            'escalera y con guía, lo que lo convierte en el lugar menos improvisable del mapa: hay ' +
            'que coordinarlo con anticipación, o solo se verán los senderos de superficie y el ' +
            'mirador.',
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
        name: 'Termales Río Negro',
        description:
            'Pozas calentadas por el volcán junto al río Negro, en la falda del Rincón de la ' +
            'Vieja, a las que se llega cruzando unos puentes colgantes pequeños. Son rústicas y se ' +
            'alimentan del río en lugar de ser construidas. El encanto está en que todavía se ' +
            'siente como un río y no como un spa.',
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
            'El volcán más alto del país y uno al que se puede llegar en carro hasta el borde del ' +
            'cráter, lo que lo vuelve uno de los pocos lugares accesibles de verdad para ' +
            'cualquiera. Hay que ir temprano: el cráter suele estar despejado al amanecer y tapado ' +
            'de nubes a media mañana. Arriba hace frío y no hay dónde resguardarse, y quien sube ' +
            'desde el Valle Central suele subestimarlo bastante.',
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
            'Bosque nuboso húmedo y denso al borde de la cordillera de Talamanca, con senderos ' +
            'cortos junto al río y uno de los índices de lluvia más altos del país. El atractivo ' +
            'es el agua y las aves, no un único punto estrella.',
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
            'El que pasó años en erupción de verdad: la ceniza sobre los carros en San José venía ' +
            'de aquí. El acceso depende por completo de la actividad del momento y ha estado ' +
            'cerrado durante temporadas largas. Cuando abre, el camino atraviesa un terreno alto, ' +
            'pelado y barrido por el viento que no se parece a ningún otro lugar del país.',
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
            'El sitio precolombino más importante del país: calzadas de piedra, montículos y un ' +
            'sistema de acueductos que todavía funciona, en la falda del Turrialba y bajo el ' +
            'bosque. Es modesto al lado de las ruinas mesoamericanas, y justamente por eso vale la ' +
            'pena: es tranquilo, y lo que impresiona es la ingeniería.',
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
            'Pozas termales en el valle de Orosi, alimentadas por el sistema geotérmico del Irazú ' +
            'y el Turrialba, con uno de los valles más verdes del Valle Central de fondo. Quedan ' +
            'mucho más cerca de San José que las termales de Guanacaste, lo que las convierte en ' +
            'la opción realista para una escapada entre semana.',
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
            'El descenso de aguas bravas por el que se conoce al país, clase III a IV por un cañón ' +
            'sin acceso por carretera, y por eso el paisaje se mantiene durante todo el recorrido. ' +
            'Los operadores salen de los alrededores de Tres Equis, en las afueras de Turrialba. ' +
            'Se puede bajar casi todo el año, y viene más crecido en la época lluviosa.',
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
            'El sector del Braulio Carrillo sobre Heredia, donde el sendero sube entre bosque ' +
            'nuboso cubierto de musgo hasta una laguna quieta en el cráter. Mucho menos visitado ' +
            'que el Poás o el Irazú porque hay que caminarlo en lugar de llegar en carro, y en eso ' +
            'está casi todo su encanto.',
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
            'La muralla de bosque que la carretera a Limón atraviesa de lleno: empinada, húmeda y ' +
            'tan densa que a velocidad se ve como una sola masa verde. El sector Quebrada González ' +
            'tiene senderos cortos a la orilla de la carretera, lo que lo vuelve el bosque ' +
            'lluvioso primario más fácil de alcanzar desde San José.',
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
            'La alternativa más suave al Pacuare en aguas bravas, clase II a III por La Virgen, ' +
            'apta para quien nunca ha hecho rafting, entre bosque de bajura con muy buena fauna en ' +
            'las orillas. El tramo arriba de La Virgen sube de nivel para quien lo quiera.',
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
            'El punto más alto de Costa Rica, a 3820 m, y el único lugar del país con páramo de ' +
            'verdad por encima del límite del bosque. Son dos días como mínimo: una subida larga ' +
            'desde San Gerardo de Rivas hasta el albergue base Crestones, y luego un ascenso de ' +
            'madrugada a la cima para estar arriba antes que las nubes. Las camas del albergue se ' +
            'reservan por medio del SINAC y se agotan con meses de anticipación. No es un lugar ' +
            'que se pueda decidir la misma mañana.',
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
            'Dos caídas sobre el río Barú: una alta arriba y otra más ancha abajo, con una poza ' +
            'profunda que es de las mejores para nadar de cualquier catarata del país. Se llega ' +
            'caminando, a caballo o en un transporte 4x4; la caminata es larga y calurosa, pero no ' +
            'técnica.',
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
            'Robledal y bosque nuboso de altura a lo largo de la carretera del Cerro de la Muerte, ' +
            'y el lugar más confiable del país para ver de verdad un quetzal. La mejor época es la ' +
            'de anidación, más o menos de marzo a junio, temprano y cerca de los aguacatillos con ' +
            'fruta. Hace frío, y a esta altura el clima cambia rápido.',
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
            'La reserva de bosque nuboso sobre la divisoria continental. Los puentes colgantes lo ' +
            'ponen a uno en el dosel, donde de verdad están las epífitas y las aves, y los ' +
            'senderos de abajo son suaves y están bien hechos. Aquí casi todas las tardes llueve ' +
            'de lado, y eso es el ecosistema funcionando, no mala suerte.',
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
            'Pequeño, concurrido y aun así vale la pena: bosque lluvioso que baja directo hasta ' +
            'playas de arena blanca, con perezosos, monos cariblancos y congos tan cerca que es la ' +
            'fauna la que lo encuentra a uno y no al revés. La entrada diaria tiene cupo y el ' +
            'parque cierra un día a la semana; llegar a la hora de apertura es la diferencia entre ' +
            'una buena visita y una fila.',
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
            'El lugar con más vida del país y el más difícil de alcanzar: bosque lluvioso primario ' +
            'de bajura en la península de Osa, con dantas, las cuatro especies de mono y una de ' +
            'las pocas poblaciones viables de jaguar que quedan. La entrada exige un guía ' +
            'certificado y reservas en las estaciones de guardaparques hechas con mucha ' +
            'anticipación; al sector Sirena se llega caminando o en bote, no por carretera.',
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
            'La barra de arena frente a Uvita que forma una cola de ballena con la marea baja. La ' +
            'forma es real y se puede caminar sobre ella, pero solo con la marea correcta, así que ' +
            'aquí el horario es todo el plan. Las ballenas jorobadas pasan en dos migraciones ' +
            'distintas, lo que le da al parque una temporada de ballenas inusualmente larga.',
        location: { type: 'Point', coordinates: [-83.73429, 9.13051] },
        province: 'Puntarenas',
        activityTypes: ['snorkeling', 'hiking'],
        difficulty: 'easy',
        bestTimeOfDay: 'anytime', // Governed by the tide table, not the clock
        swimmable: true,
        estimatedDurationHrs: 3,
        permitRequired: true,
        oneDayTrip: true,
        images: [],
    },
    {
        name: 'Catarata Uvita',
        description:
            'Una caída corta un poco tierra adentro de Uvita, con un tobogán de roca lisa por el ' +
            'que la gente se desliza hasta la poza. Pequeña, fácil de alcanzar y mucho más poza ' +
            'para nadar que caminata, así que combina naturalmente con Marino Ballena el mismo ' +
            'día.',
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
            'El canopy sobre el bosque nuboso de Monteverde, con uno de los cables más largos de ' +
            'América Latina y un columpio Tarzán sobre una quebrada. Aquí el clima decide por su ' +
            'cuenta: el mismo viento que alimenta el bosque nuboso es el que detiene los cables.',
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
            'Un sendero costero plano entre el mar y el bosque, con el arrecife de coral vivo más ' +
            'accesible del país justo frente a la costa. El snorkel sobre el arrecife solo se hace ' +
            'con guía. La entrada por el lado de Kelly Creek es por donación, lo que lo vuelve uno ' +
            'de los parques nacionales más baratos de visitar.',
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
            'Una red de canales de agua dulce detrás de la playa caribeña, sin carretera de ' +
            'acceso: se llega en bote o en avioneta, y uno se mueve de la misma forma. El desove ' +
            'de la tortuga verde, más o menos de julio a octubre, es lo más famoso, pero los ' +
            'canales son la razón para quedarse: caimanes, nutrias y tres especies de mono desde ' +
            'una canoa a remo al amanecer.',
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
            'El tramo de costa caribeña al sur de Puerto Viejo donde el bosque llega hasta la ' +
            'arena: un sendero costero hacia Punta Mona, agua tranquila protegida por el arrecife ' +
            'para hacer snorkel frente a Manzanillo, y mucha menos gente que en Cahuita. El ' +
            'sendero después de Manzanillo se pone barroso y confuso; es el único tramo de aquí en ' +
            'el que vale la pena llevar guía.',
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
