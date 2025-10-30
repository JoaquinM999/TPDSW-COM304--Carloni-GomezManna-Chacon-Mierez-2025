import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './src/entities/saga.entity';
import { Libro } from './src/entities/libro.entity';
import { Autor } from './src/entities/autor.entity';
import { Categoria } from './src/entities/categoria.entity';
import { Editorial } from './src/entities/editorial.entity';

/**
 * Script para crear Sagas de master data y asociarlas a libros existentes.
 * Este archivo fue generado automáticamente desde la base de datos.
 * Uso: ts-node seed-sagas.ts
 */

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('Creando sagas de master data...');

    // Datos de master data exportados de la base de datos
    const masterData = {
      autores: [
      {
        id: 11,
        nombre: "Rebecca",
        apellido: "Yarros",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 12,
        nombre: "Eva",
        apellido: "García Sáenz de Urturi",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 13,
        nombre: "Ana",
        apellido: "Huang",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 14,
        nombre: "Holly",
        apellido: "Jackson",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 15,
        nombre: "Colleen",
        apellido: "Hoover",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 16,
        nombre: "Richard",
        apellido: "Osman",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 17,
        nombre: "J.K.",
        apellido: "Rowling",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 18,
        nombre: "J.",
        apellido: "K. Rowling",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 9,
        nombre: "John",
        apellido: "Ronald Reuel Tolkien",
        createdAt: new Date("2025-10-21T00:00:00.000Z")
      },
      {
        id: 19,
        nombre: "J.",
        apellido: "R. R. Tolkien",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 20,
        nombre: "J",
        apellido: "R R Tolkien",
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
    ],
    categorias: [
    ],
    editoriales: [
    ],
    libros: [
      {
        id: 6,
        nombre: "Alas de hierro (Empíreo 2)",
        sinopsis: "<p> <b>«En el primer año algunos pierden la vida. En el segundo año, los que sobrevivimos perdemos la compasión». —Xaden Riorson</b> </p> <p>Todos esperaban que Violet Sorrengail muriera en su primer año en el Colegio de Guerra de Basgiath, incluso ella misma. Pero la Trilla fue tan solo la primera de una serie de pruebas imposibles destinadas a deshacerse de los pusilánimes, los indignos y los desafortunados.</p> <p>Ahora comienza el verdadero entrenamiento y Violet no sabe cómo logrará superarlo. No solo porque es brutal y agotador ni porque está diseñado para llevar al límite el umbral del dolor de los jinetes, sino porque el nuevo vicecomandante está empeñado en demostrar a Violet lo débil que es a menos que traicione al hombre que ama.</p> <p>Aunque el cuerpo de Violet es más frágil que el de sus compañeros, su fuerza radica en su ingenio y voluntad de hierro. Además, los líderes están olvidando la lección más importante que Basgiath les ha enseñado: los jinetes de dragones crean sus propias reglas.</p> <p>La voluntad de sobrevivir no será suficiente este año, porque Violet conoce el secreto que se oculta entre los muros del colegio y nada, ni siquiera el fuego de dragón, será suficiente para salvarlos.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=OJjkEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71cBIr6BcVMuuzky9pawx_ndHfhfDYPBstiXexcRPpOiAvb90iYSV9n2vk0tVKeNFg8JVoZHIlBb2eEzhKkOZQtc5k2H4CYtnIiy0XJyNtz12SEXMnhLVSRUs7ZP57FCysX1Ywq&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=OJjkEAAAQBAJ&source=gbs_api",
        externalId: "OJjkEAAAQBAJ",
        source: "google",
        autorId: 11,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 7,
        nombre: "Alas de sangre (Empíreo 1)",
        sinopsis: "<p> <b>«¡El libro de fantasía más adictivo que he leído en una década!».—Tracy Wolff, autora bestseller del New York Times </b> </p> <p> <b> <i>Bestseller</i> del <i>New York Times </i> </b> </p> <p> <b>Un dragón sin su jinete es una tragedia. Un jinete sin su dragón está muerto.</b> <br> <b>—Artículo uno, sección uno del Código de jinetes de dragones</b> </p> <p>Violet Sorrengail creía que a sus veinte años se uniría al Cuadrante de los Escribas para vivir una vida tranquila, estudiando sus amados libros y las historias antiguas que tanto le fascinan. Sin embargo, por órdenes de su madre, la temida comandante general, Violet debe unirse a los miles de candidatos que luchan por formar parte de la élite de Navarre: los jinetes de dragones.</p> <p>Cuando eres más pequeña y frágil que los demás tu vida corre peligro, porque los dragones no se vinculan con humanos débiles; de hecho, los incineran. Sumado a esto, con más jinetes que dragones disponibles, buena parte de los candidatos mataría a Violet con tal de mejorar sus probabilidades de éxito; otros, como el despiadado Xaden Riorson, el líder de ala más poderoso del Cuadrante, la asesinarían simplemente por ser la hija de la comandante general. Para sobrevivir, necesitará aprovechar al máximo todo su ingenio.</p> <p>Día tras día, la guerra que se libra al exterior del Colegio se torna más letal, las defensas del reino se debilitan y los muertos aumentan. Por si fuera poco, Violet sospecha que los líderes de Navarre esconden un terrible secreto.</p> <p>Amistad, rivalidad y pasión... en el Colegio de Guerra de Basgiath todos tienen una agenda oculta y saben que una vez adentro solo hay dos posibilidades: graduarse o morir.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=6PjIEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72N1sjLLnPDjFJ-gOGrPLntyCTqS5Rl6MNu9mJ9cpB7Y3gEzd1P52Kn2zN7ti7uF_tMpeSioGKzp6Gwq4M7JXu0fY3VrWTYnFN0apqdb-Lu0yKkx5IqGlpcOl3EvAZrvuBVMBOj&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=6PjIEAAAQBAJ&source=gbs_api",
        externalId: "6PjIEAAAQBAJ",
        source: "google",
        autorId: 11,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 8,
        nombre: "Alas de ónix (Empíreo 3)",
        sinopsis: "<p> <b>Una tormenta se aproxima y no todos sobrevivirán a su furia.</b> </p> <p>Tras casi dieciocho meses en el Colegio de Guerra Basgiath, Violet Sorrengail tiene claro que no queda tiempo para entrenar. Hay que tomar decisiones. La batalla ha comenzado y, con enemigos acercándose a las murallas e infiltrados en sus propias filas, es imposible saber en quién confiar.</p> <p>Ahora Violet deberá emprender un viaje fuera de los límites de Aretia en busca de aliados de tierras desconocidas que acepten pelear por Navarre. La misión pondrá a prueba su suerte, y la obligará a usar todo su ingenio y fortaleza para salvar a quienes más ama: sus dragones, su familia, su hogar y a <i>él</i>.</p> <p>Aunque eso signifique tener que guardar un secreto tan peligroso que podría destruirlo todo.</p> <p>Navarre necesita un ejército. Necesita poder. Necesita magia. Y necesitará algo que solo Violet puede encontrar: la verdad.</p> <p>Pero una tormenta se aproxima... y no todos sobrevivirán a su furia.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=VpQnEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70l-tAJF3VJeJbkqrXcy3D9cK-vweCfbJdvBOz-k04Qh0OfjpxYi_otByq0QnqIAXOnq4x7xuZDQcxhKB799VH5wKa0Wg0mKobi46qfautX5ItnGA8V-7dl8f6tfhUJVbcVB0SV&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=VpQnEQAAQBAJ&source=gbs_api",
        externalId: "VpQnEQAAQBAJ",
        source: "google",
        autorId: 11,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 9,
        nombre: "La saga de los longevos 2. Los Hijos de Adán",
        sinopsis: "<p> <b>Para un longevo el pasado siempre vuelve en forma de problemas LA CUENTA ATRÁS ESTÁ LLEGANDO A SU FIN NO TE PIERDAS LA SAGA MÁS ESPERADA DE LA AUTORA DE EL SILENCIO DE LA CIUDAD BLANCA</b> </p> <p> <b>La inesperada vuelta de Gunnarr,</b> el hijo que Iago del Castillo creyó muerto en 1602, alterará la tranquila vida que este y Adriana habían conseguido construir en Santander.</p> <p> <b>23 <i>.</i>000 a. C., Europa:</b> Lür, que teme ser el único hombre sobre la tierra, recorre un continente desolado <b>en busca del clan de Los Hijos de Adán</b> y de su legendaria matriarca, Adana, de quien se dice que no envejece.</p> <p> <b>800 d. C., Dinamarca:</b> Gunnarr se convierte en berserker, un guerrero perteneciente a <b>un grupo de mercenarios vikingos</b> que no sienten dolor.</p> <p> <b>1620 d. C., Nueva Inglaterra:</b> Urko se embarca en el Mayflower para construir la colonia de Plymouth. Allí conocerá a Manon Adams, <b>una mujer que dejará huella en él a pesar del paso del tiempo</b>.</p> <p>La Vieja Familia está a punto de descubrir que ha estado en peligro desde antes de su nacimiento, porque, para un longevo, <b>el pasado siempre vuelve en forma de problemas,</b> y estos solo acaban de empezar.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=rJw0EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73LWzyia1UIq2ITFSR5tAs3UkVROFeOoXQzlYbEIcjgkN-Rahca3FKwSIGUaNXVJ5J8y_1ubz6Pz3aB-j5Ic2musaqfS-E1o3GwrHAOzJ3ZNvcZn2X_xSmb8KzFp0mPUN7fhxzz&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=rJw0EQAAQBAJ&source=gbs_api",
        externalId: "rJw0EQAAQBAJ",
        source: "google",
        autorId: 12,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 10,
        nombre: "La saga de los longevos 1. La Vieja Familia",
        sinopsis: "<p> <b>Nunca olvides que ser longevo no te hace inmortal. COMIENZA LA CUENTA ATRÁS. NO TE PIERDAS LA SAGA MÁS ESPERADA.</b> </p> <p>Iago del Castillo es un <b>carismático y atractivo longevo</b> de 10.300 años de edad con un cerebro prodigioso. <br> Sin embargo, cuando una mañana <b>despierta en San Francisco</b>, lejos de su hogar en Santander, no es capaz de recordar ni su nombre ni los detalles de la <b>misteriosa investigación </b>que le ha llevado hasta allí; una investigación con la que pretende descifrar los motivos por los que ni él ni los demás miembros de su familia envejecen. <br> Pero ni Iago ni Héctor, su padre, tienen intención de compartir los resultados; ellos <b>son conscientes de los riesgos</b> y el sufrimiento que implica su modo de vida. Son sus hermanos Jairo (un conflictivo escita de casi 3000 años) y Kyra (una huidiza celta de 2500 años) los que, <b>cansados de transitar solos</b> a través de los siglos y hastiados de tener que enterrar a sus hijos, están empeñados en <b>crear una estirpe de longevos</b> como ellos. <br> Al mismo tiempo, Adriana, una arqueóloga especializada en Prehistoria, está dispuesta a aprovechar que el destino la ha traído de vuelta a su Santander natal para <b>aclarar el extraño suicidio de su madre</b> ocurrido quince años atrás. <br> Desde el principio, Iago y ella <b>sentirán una poderosa atracción</b> el uno por el otro, aunque ambos intenten ignorarlo.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=RRQTEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE7237F95a0S03Oh13R6a_zm_ycGUw2F2IQM1iZmcdhPsFkAbnzXlrixtDkQflqxty1sWlc4CjJcC_7SpeRm8dwnSGC9TzZptatNP1uNKpzdX5UNPxZ5CTyZWeoMuV2of_GveUci6&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=RRQTEQAAQBAJ&source=gbs_api",
        externalId: "RRQTEQAAQBAJ",
        source: "google",
        autorId: 12,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 11,
        nombre: "La saga de los longevos 3. El Camino del Padre",
        sinopsis: "<p> <b>¿Y si la mayor amenaza para los longevos son ellos mismos? LA CUENTA ATRÁS HA LLEGADO A SU FIN. NO TE PIERDAS LA SAGA MÁS ESPERADA DE LA AUTORA DE EL SILENCIO DE LA CIUDAD BLANCA</b> </p> <p>Cinco cadáveres aparecen <b>calcinados tras una brutal explosión</b> en la clínica de Nueva York donde han operado a Nagorno para tratar de salvar su vida. Temiendo que los cuerpos pertenezcan a la Vieja Familia, en venganza por el asesinato de la sanguinaria matriarca de los Hijos de Adán, <b>Gunnarr huye con Adriana</b> para evitar ser ellos los siguientes.</p> <p> <b> <i>Bristol, 1352:</i> </b> Gunnarr vive un romance con Madre, pero cuando ella descubre que él es <b>descendiente de su gran enemigo Lür</b>, Gunnarr comprende que toda <b>la Vieja Familia está en peligro</b>.</p> <p> <b> <i>Presente, Massachusetts:</i> </b> Iago sufre una nueva laguna de memoria tras <b>ver morir a Adriana</b>. Cuando despierta, comienza a sospechar que Manon quiere <b>entregarlo a sus enemigos</b>.</p> <p> <b> <i>Presente, Java:</i> </b> Lür trata de localizar a Iago y rastrear a los líderes de las ramas del clan para <b>pactar una tregua</b>. Lo que no imagina es que Nagorno tiene sus propios planes: ser el <b>patriarca de los Hijos de Adán</b>.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=K1hVEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70fPFTWZhPmOrhSnWJJ3HKuao7RXPYbX1PpilDvYeRS78erCt6Qvgl12w6WrEEaXwKNPPQX_hqZKMUxf2921-jWRcO4q6_J6EPnM6X9NM-VZyuO9pKF_h0gpFY9pFlurOnIL2yC&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=K1hVEQAAQBAJ&source=gbs_api",
        externalId: "K1hVEQAAQBAJ",
        source: "google",
        autorId: 12,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 12,
        nombre: "Pecados 1. Rey de la ira",
        sinopsis: "<p> <b>Déjate tentar por la nueva serie Pecados de Ana Huang.</b> </p> <p> <b>Ella es la esposa que él nunca quiso... y la debilidad que no vio venir.</b> <b> </b> </p> <p> <b>Implacable. Meticuloso. Arrogante.</b> </p> <p>Nada escapa al control del multimillonario Dante Russo, ya sea en su trabajo o en su vida.</p> <p>Nunca planeó casarse... pero el chantaje lo obliga a <b>comprometerse con Vivian Lau</b>, la heredera de un imperio de la joyería e hija de su mayor enemigo.</p> <p>No le importa lo <b> hermosa o encantadora</b> que sea. Hará todo lo que esté en su mano para liberarse de la <b>extorsión y de su compromiso</b>.</p> <p>El único problema es que <b> ahora que la tiene, no quiere dejarla ir.</b> </p> <p> <p> <b>Elegante. Ambiciosa. Cortés.</b> </p> <p>Vivian Lau es la <b>hija perfecta</b>.</p> <p>Casarse con un Russo significa abrir las puertas de un mundo que ni su familia es capaz de comprar. Dante está lejos de ser el marido que ella imaginaba para sí, pero el deber es más fuerte que cualquiera de sus deseos.</p> <p> <b>Ansiar su tacto</b> nunca fue parte del plan...</p> <p> <b>Y enamorarse de su futuro marido</b>, tampoco.</p> <p> <p>• Matrimonio de conveniencia</p> <p>• <i>Fake dating</i> </p> <p>• <i>Enemies to lovers</i> </p> <p>• Proximidad forzada</p> <p>• Billonarios</p> <p>• <i>Spicy</i> </p>",
        imagen: "http://books.google.com/books/publisher/content?id=X9QCEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE711gFA3zpf1G0PVra9wenwMH1YGxERJ0XnROWafQKJN3M5uI5lF1Kd0t2ObPcdTn2EvHswD1HTlq7xMCg9FmQkYcd-2KPIKQ7Q7dKFQfUT8Oj-YEmRdPI6JdNt7FyuDPuONs7rM&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=X9QCEQAAQBAJ&source=gbs_api",
        externalId: "X9QCEQAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 13,
        nombre: "Pecados 2. Rey de la soberbia",
        sinopsis: "<p> <b>Déjate tentar por la segunda entrega de la nueva serie Pecados de Ana Huang.</b> </p> <p> <b>INTROVERTIDO. CAUTELOSO. EXTREMADAMENTE CORRECTO.</b> <br> Kai depende de una votación para convertirse en el <b>CEO de su imperio familiar</b>, por lo que el <b>billonario</b> no puede permitirse el lujo de distraerse con Isabella. <b>Sofocado por responsabilidades y promesas</b>, cuando están juntos siente que finalmente puede respirar.</p> <p> <b>AUDAZ. IMPULSIVA. ALEGRE.</b> <br> Isabella no ha asistido a una sola fiesta en la que no fuera el <b>centro de atención</b> ni ha conocido a un hombre al que no <br> pueda enamorar..., excepto a Kai, que es miembro del club exclusivo en el que <b>trabaja como camarera</b>. <br> Pero aunque les cueste todo lo que tienen, no pueden resistirse a <b>caer en la tentación de sus deseos prohibidos.</b> </p> <p> <b> </p> <p>• Polos opuestos</p> <p>• Romance prohibido</p> <p>• <i>Slow burn</i> </p> <p>• Billonarios</p> <p>• <i>Spicy</i> </p>",
        imagen: "http://books.google.com/books/publisher/content?id=JW8WEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71NuGumVX26Tsa806hfhu_cADM12_gGsp9wRIo05phdtYd8rd6AosxA9jUkkEvRf-y9QI7VpiBtuLrah5D4exwGJPdpRD2xnYsjpcJAa2dwQZG9IeROwUEYmXvYTZpHL9FAhmGi&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=JW8WEQAAQBAJ&source=gbs_api",
        externalId: "JW8WEQAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 14,
        nombre: "Pecados 3. Rey de la codicia",
        sinopsis: "<p> <b>Déjate tentar por la tercer entrega de la serie Pecados de Ana Huang.</b> </p> <p> <b>La tuvo, la perdió... y hará todo lo posible para recuperarla. </b> </p> <p> <b>Poderoso. Brillante. Ambicioso.</b> </p> <p> <b>Dominic Davenport</b> se convirtió en el <b>rey de Wall Street</b> a base de sangre, sudor y lágrimas.</p> <p> <b>Lo tiene todo</b>: una enorme casa, una hermosa esposa y más dinero que podría gastar en su vida.</p> <p>Pero no importa cuánto acumule, <b>nunca es suficiente</b>, y enfocado en siempre tener más, aleja a la única persona que siempre estuvo a su lado.</p> <p>Y cuando se va, Dominic se da cuenta de que hay cosas más importantes que riquezas y gloria... pero <b>ya es tarde</b>.</p> <p>La tuvo, la perdió y hará cualquier cosa por recuperarla.</p> <p> </p> <p>***</p> <p> <br> <b>Amable. Inteligente. Reflexiva.</b> </p> <p> <b>Alessandra Davenport</b> ha desempeñado el papel de <b>esposa perfecta</b> durante años.</p> <p>Acompañó a su marido mientras construía su <b>imperio</b>, pero ahora que han llegado a la <b>cima</b>, se da cuenta de que ya no es el hombre del que se enamoró.</p> <p>Cuando le queda claro que siempre estará en segundo lugar después de su trabajo, decide ponerse a sí misma en primer lugar, incluso si eso significa dejar al único hombre que ha amado.</p> <p>Pero no contaba con que Dominic se negara a dejarla ir... ni con que luchara por <b>reconstruir su matrimonio</b>, a cualquier precio.</p> <p> <p>• Segundas oportunidades</p> <p>• Crisis de pareja</p> <p>• Billonarios</p> <p>• <i>Spicy</i> </p>",
        imagen: "http://books.google.com/books/publisher/content?id=ke9BEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70R5Q5RYsWC3IDDlAa6L6nTM6w1oAtJJqKamD8KCKoxGtWy7Vs4TttHXqQleY4X4Y_aeKPb_vp0E1YK82-ZfqFTbXlGWK70mZMA9Zw3J3WAYX587diqCmcY-5o81JeZ20L4jEpr&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=ke9BEQAAQBAJ&source=gbs_api",
        externalId: "ke9BEQAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 15,
        nombre: "Pecados 4. Rey de la desidia",
        sinopsis: "<p> <b>Déjate tentar por la cuarta entrega de la serie Pecados de Ana Huang.</b> </p> <p> <b>Encantador. Tranquilo. Despreocupado.</b> </p> <p> <b>Xavier Castillo</b> tiene el mundo a sus pies, pero, para disgusto de su padre, no tiene ningún interés en el <b>imperio familiar</b>.</p> <p>Nada le alegra más que irritar a su <b>publicista</b> y vivir de <b>fiesta</b> en fiesta, pero cuando una <b>tragedia</b> los acerca más que nunca, debe lidiar con la <b>incertidumbre</b> de su futuro y la comprensión de que la única persona inmune a sus encantos es la única a la que realmente quiere.</p> <p> <b>***</b> </p> <p> <b>Reservada. Inteligente. Ambiciosa.</b> </p> <p> <b>Sloane Kensington</b> es una <b>publicista</b> poderosa que está acostumbrada a tratar con <b>clientes difíciles</b>.</p> <p>Sin embargo, nadie la enfurece o tienta más que cierto heredero <b>multimillonario</b>, con sus estúpidos hoyuelos y su actitud relajada. </p> <p>Puede que se vea obligada a <b>trabajar con él</b>, pero nunca se <b>enamorará</b> de él... no importa lo rápido que le haga latir <b>el corazón</b> o lo considerado que sea bajo su personalidad fiestera. </p> <p>Él es su cliente y eso es todo lo que será...</p> <p> <p>• Proximidad forzada</p> <p>• <i>Grumpy/sunshine</i> </p> <p>• Billonarios</p> <p>• <i>Spicy</i> </p>",
        imagen: "http://books.google.com/books/publisher/content?id=af5cEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73A4FZoy3KJmP4Tu11odILMm2KHr312HexTSNkzKSjkKp24WTKbQLp8ahYrfBJz0evg7k-qv8A54RfPskj3HdRNGZevjO5ewpBRS-FJqZgFNoV8trhjzcNFHUiNoyJpWBCoYDNb&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=af5cEQAAQBAJ&source=gbs_api",
        externalId: "af5cEQAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 16,
        nombre: "Twisted Love",
        sinopsis: "TIKTOKSUCCÉN, ÄNTLIGEN PÅ SVENSKA!<br><br>Alex Volkov är en djävul med änglalikt ansikte som förbannats med ett förflutet han inte kan fly ifrån. Driven av en tragedi som har hemsökt honom större delen av hans liv lämnar hans hänsynslösa jakt på framgång och hämnd litet utrymme för känslor.<br><br>Fotostudenten Ava Chen bor ihop med sin bästa vän Jules och är en fri själ fängslad av mardrömmar från en barndom hon inte minns. Men sitt trasiga förflutna till trots har hon aldrig upphört att se världens skönhet ... inklusive hjärtat bakom den iskalla fasaden hos en man hon inte borde vilja ha: sin brors bästa vän.<br><br>Alex och Avas kärlek borde aldrig ha fått hända – men när den gör det släpper den lös hemligheter som kan förgöra dem båda och allt de har kärt.<br><br>Ana Huang har toppat försäljningslistorna på bland andra New York Times, Wall Street Journal och USA Today. TikTok-hashtaggen #twistedseries har över 800 miljoner visningar.",
        imagen: "http://books.google.com/books/publisher/content?id=i3jmEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73CRivoerigcsFxtMmVgQkP63IModZscojzsObh_P2DMPWu7LP60p5TWXw7kSsrzuPg1d5-F-HrzU92tzZzPz4UDSOpXAZbjTxkNAa_mvpWwry9o01bycHAJ1gHao4kxEyCz-of&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=i3jmEAAAQBAJ&source=gbs_api",
        externalId: "i3jmEAAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 17,
        nombre: "Twisted 2. Twisted Games",
        sinopsis: "<p> <b>Ella es inalcanzable... excepto para </b> <b>é</b> <b>l. Descubre la saga más explosiva del momento. </b> </p> <p>Arrogante y engreído, Rhys Larsen es un guardaespaldas de lujo que tiene dos normas:</p> <p>1) Proteger a sus clientes a toda costa.</p> <p>2) No vincularse emocionalmente. Jamás.</p> <p> <br> Y nunca tuvo la menor tentación de romper estas reglas... hasta que llegó ella.</p> <p>Ella es Bridget von Ascheberg: una princesa con un temperamento incontenible y un fuego escondido capaz de reducir a ceniza cualquier regla de Rhys.</p> <p>Esta es la historia de un amor inesperado e imposible... y lleno de fantasías prohibidas.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=8BWiEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71DibJY8J7E_pmw1Sh-ayENBoFwEVYjuqz3hO7p1sHngM7hMpZ_ysP4NsH6fxejs7tT3im4gRamkE6OKpdznbF-tgpWB2jo0wlHSC-BK8Q6_FVvQu4xm00ryATLTj2IOQzJ25XG&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=8BWiEAAAQBAJ&source=gbs_api",
        externalId: "8BWiEAAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 18,
        nombre: "Twisted 3. Twisted Hate",
        sinopsis: "<p> <b>Déjate seducir por la saga MÁS EXPLOSIVA.</b> </p> <p> <b>Más de 3 millones de lectoras ya han caído en la tentación de Ana Huang.</b> </p> <p> <b>Él la odia... casi tanto como la desea.</b> </p> <p> <b>Josh Chen</b> es ambicioso, arrogante y no se le resiste ninguna mujer. Ninguna excepto <b>Jules Ambrose</b>. La <b>enemistad</b> entre ellos es tan obvia como lo es su <b>deseo</b> que, desde que se conocen, no hace más que aumentar. Y, cuando la tensión por fin estalle, Josh propondrá un trato imposible de rechazar: un acuerdo entre enemigos con beneficios y <b>3 sencillas reglas</b>:</p> <p>Sin celos</p> <p>Sin condiciones.</p> <p>Y, por supuesto, sin enamorarse.</p> <p>Extrovertida y ambiciosa, Jules Ambrose ha dejado atrás un pasado de desenfreno para centrarse en un objetivo: convertirse en abogada. Y ahora mismo, lo último que necesita es involucrarse con un hombre que es tan <b>insufrible como atractivo</b>. Pero con el paso del tiempo, se dará cuenta de que Josh es mucho más de lo que aparenta.</p> <p>El hermano de su mejor amiga.</p> <p>Su némesis.</p> <p>Y su único refugio</p> <p>La suya es una pareja hecha en el infierno, y cuando los demonios de su pasado los alcancen, se enfrentarán a <b>verdades que podrían salvarlos</b>... o <b>destruirlos por completo</b>.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=U47OEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71r9SHz3VRh9H1LoLCdipdelGDGvJwWaxAOm4KnX-3K5Evi6Sfc4ZCyeR-R0ISNTHY7vBbFKBaDphusH9L0gvE642jVlQDpM7lU72OzDNKxbaMQuu-exMHHlRUO1NIbAHp5MO5s&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=U47OEAAAQBAJ&source=gbs_api",
        externalId: "U47OEAAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 19,
        nombre: "Twisted 4. Twisted Lies",
        sinopsis: "<p> <b>Déjate seducir por la saga MÁS EXPLOSIVA.</b> </p> <p> <b>Más de 3 millones de lectoras ya han caído en la tentación de Ana Huang.</b> </p> <p> <b>Él hará lo que sea para tenerla... incluido mentir.</b> </p> <p>Encantador, peligroso y lo suficientemente inteligente como para ocultarlo, a Christian Harper le resulta poco útil la moral y aún menos el amor, pero no puede negar la extraña atracción que siente hacia la mujer que vive justo un piso debajo de él. Ella es el objeto de sus deseos más oscuros, el único rompecabezas que no puede resolver. Y cuando surge la oportunidad de acercarse a ella, rompe sus propias reglas para ofrecerle un trato imposible de rechazar. Todos tenemos un punto débil. Ella es el suyo.</p> <p>Su obsesión.</p> <p>Su adicción.</p> <p>Su única excepción.</p> <p>Dulce, tímida e introvertida a pesar de su fama en las redes sociales, Stella Alonso es una romántica que mantiene su corazón a buen recaudo. Entre sus dos trabajos, tiene poco tiempo y ninguna gana de iniciar una relación. Pero cuando una amenaza del pasado la lleva a los brazos (y a la casa) del hombre más peligroso que jamás haya conocido, caerá en la tentación de permitirse sentir algo por primera vez en mucho tiempo. Porque, a pesar de la naturaleza fría de Christian, él la hace sentir completa cuando están juntos.</p> <p>Apasionada.</p> <p>Protegida.</p> <p>Anhelada.</p> <p>El suyo es un amor amenazado por mentiras y secretos... y cuando las verdades por fin salgan a la luz, podrían destrozarlo todo.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=JYfnEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE702F8LRkTLl9_zeg0U2K8xcVnY9zadfmsO1G5g_sa3vVlN1xiOQIqJDFFzyNlgu5xTBqUhwjLSq90xMmismjhHe_E3pMjrP3S-Z0eXSTX1zXO8NtNg0g8HXjkoU5X4qcblj-IAR&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=JYfnEAAAQBAJ&source=gbs_api",
        externalId: "JYfnEAAAQBAJ",
        source: "google",
        autorId: 13,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 20,
        nombre: "Asesinato para Principiantes / a Good Girl ́s Guide to Murder",
        sinopsis: "<p><b>¿Quién mató a Andie Bell? Todos creen saber la verdad, pero solo Pippa sabe que están equivocados.</b></p> <p>Hace cinco años, la estudiante Andie Bell fue asesinada por Sal Singh. La policía sabe que fue él. Sus compañeros también. Todo el mundo lo sabe.</p> <p>Pero Pippa creció en la misma ciudad que ha sido consumida por este crimen y para ella no es tan claro... Decidida a desenterrar la verdad, Pippa convierte la investigación de este asesinato en el tema de su proyecto de final de clase. Poco a poco, empezará a descubrir un montón de secretos que alguien se ha esforzado en ocultar muy bien. Si el asesino sigue suelto, ¿qué será capaz de hacer para mantener a Pippa alejada de la verdad?</p> <p>Un thriller con una joven investigadora que destapará los secretos más turbios de su pequeña y, supuestamente, tranquila comunidad.</p> <p><b>ENGLISH DESCRIPTION</b></p> <p>Everyone in Fairview knows the story.<br> <br> Pretty and popular high school senior Andie Bell was murdered by her boyfriend, Sal Singh, who then killed himself. It was all anyone could talk about. And five years later, Pip sees how the tragedy still haunts her town.<br> <br> But she can't shake the feeling that there was more to what happened that day. She knew Sal when she was a child, and he was always so kind to her. How could he possibly have been a killer?<br> <br> Now a senior herself, Pip decides to reexamine the closed case for her final project, at first just to cast doubt on the original investigation. But soon she discovers a trail of dark secrets that might actually prove Sal innocent . . . and the line between past and present begins to blur. Someone in Fairview doesn't want Pip digging around for answers, and now her own life might be in danger.<br></p>",
        imagen: "http://books.google.com/books/content?id=lw1lzwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73HbOSJ2F6l5qqFP5Bs4AE7u2XiEJyYHu1-bQBs6XUgLKIwCpZ7HQIqkAURZNi4T6cYdxR_K49NyHmtuhxTVV5Ys-_MPyo1PCWLbo8rC7YN-XG7GauXTQcn1UmOaQEWM_rMXtvw&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=lw1lzwEACAAJ&source=gbs_api",
        externalId: "lw1lzwEACAAJ",
        source: "google",
        autorId: 14,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 21,
        nombre: "Desaparición para expertos",
        sinopsis: "<p>Pippa no quiere dedicarse a la <b>investigación</b>: el precio a pagar es demasiado alto. Después de <b> resolver el asesinato</b> de Andie Bell, Pippa decidió cerrar esa etapa para siempre. Y, aunque el pódcast que grabó con Ravi sobre el caso se ha hecho viral, insiste en que sus <b>días de detective</b> quedaron atrás...</p> <p>O eso es lo que ella cree. Porque cuando Jamie Reynolds desaparece y la policía no logra encontrarlo, a Pippa no le queda más remedio que volver a las andadas... Pero esta vez, todo el mundo <b>la vigila</b>.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=P_sqEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70EjpDEHtdPKNkz7Rk3uYFaNK0Bm3EbnxW4e5ocYuy6h6C_DsyQ_R7QZIUrYR4g600B854py4II_xUXzHDv_bqr4J6sX3SdOZaj9c0kYn3ccfmah33SDWSCKmgrW1vWtmIK2Dlj&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=P_sqEAAAQBAJ&source=gbs_api",
        externalId: "P_sqEAAAQBAJ",
        source: "google",
        autorId: 14,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 22,
        nombre: "Venganza para Víctimas / As Good As Death",
        sinopsis: "<p><b>Ahora, la víctima es ella. </b></p> <p>Pip está acostumbrada a recibir amenazas. Tiene un pódcast de true crime que se ha vuelto viral y, además, su labor como investigadora le ha supuesto crearse más de un enemigo. Pero, de entre todos esos mensajes que le llegan, hay unos que le preocupan. Se repiten constantemente, haciéndole una pregunta, siempre la misma: «¿Quién te buscará cuando seas tú la que desaparezca?».</p> <p>Sus temores se confirman cuando se da cuenta de que quien le envía esos anónimos ha pasado de amenazarla a perseguirla. Y todo empeorará cuando encuentre un patrón entre la forma de actuar de su acosador y la de un asesino que, en teoría, está en la cárcel desde hace años... O ¿puede ser que un inocente esté entre rejas y el asesino ande suelto? Sea como sea, Pip debe encontrar las respuestas necesarias o, esta vez sí, será ella la que desaparecerá...</p>",
        imagen: "http://books.google.com/books/content?id=ZtTZzwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE725rErEAr6TwdrGbk8SS0g3iEz0JN3pOjJsN0oio6xXPWMPOTEap_DHOehNso7jYxCu6p7O6wipl3Or74vm_ESr1CMvC5wUi5uGceUFc_JrlLEj6IsdQRRA31Ga0n4tR0_IPgKA&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=ZtTZzwEACAAJ&source=gbs_api",
        externalId: "ZtTZzwEACAAJ",
        source: "google",
        autorId: 14,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 23,
        nombre: "Romper el círculo (It Ends with Us)",
        sinopsis: "<p>A veces, quien más te quiere es quién más daño te hace. <br> <b> </p> <p>Lily no siempre lo ha tenido fácil. Por eso, su idílica relación con un magnífico neurocirujano llamado Ryle Kincaid, parece demasiado buena para ser verdad. Cuando Atlas, su primer amor, reaparece repentinamente y Ryle comienza a mostrar su verdadera cara, todo lo que Lily ha construido con él se ve amenazado. </p> <p>«Nadie escribe sobre sentimientos como Colleen Hoover.» Anna Todd</p> <p> <b> </p>",
        imagen: "http://books.google.com/books/publisher/content?id=6fNjEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71gAG-tMZIQN-FiMBi0WUJSyrgs6YznCjQfcaPLekDtPhhihjO5g66xnzC4Whf3CaPMj9yWdHIrBRzmyx0KV85t0tvAHQ7zI1_ibHkfbepnFmZTUARjh2Aeikf2V6-zLosDdgJv&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=6fNjEAAAQBAJ&source=gbs_api",
        externalId: "6fNjEAAAQBAJ",
        source: "google",
        autorId: 15,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 24,
        nombre: "Volver a empezar (It Starts with Us)",
        sinopsis: "<p> <b>Todo final tiene un principio. Y todo empezó con Atlas.</b> </p> <p> <b>La esperada continuación de <i>Romper el círculo (It Ends with Us)</i>.</b> </p> <p> Lily y su exmarido, Ryle, acaban de pactar la custodia compartida de su niña cuando Lily se encuentra de nuevo con su primer amor, Atlas. Después de casi dos años separados, está entusiasmada porque, por una vez, el tiempo está de su lado, e inmediatamente dice que sí cuando Atlas le pide una cita. </p> <p> Pero su alegría se desvanece cuando piensa que, aunque ya no están casados, Ryle sigue teniendo un papel en la familia, y no consentirá que Atlas Corrigan esté presente en su vida y en la de su hija. </p> <p>V <i> olver a empezar </i> alterna entre las perspectivas de Lily y Atlas y continúa justo donde nos dejó <i>Romper el círculo</i>. Descubriremos más sobre el pasado de Atlas y seguiremos a Lily en busca de una segunda oportunidad de encontrar el amor verdadero mientras tiene que lidiar con un exmarido celoso. <b> </p>",
        imagen: "http://books.google.com/books/publisher/content?id=SPSaEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73ZilKKiuJn_0NLfnxt3dszCQQ0RlbJtHZKyND6syUMuMTPQ5Enw7_fie9rRF6fz6Luz3euJFurVNkt_iXmvw0kPSVWJiTjybk7rb6MTdYbzCj-IYnsiWmr_fVnx6-AgUY11a62&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=SPSaEAAAQBAJ&source=gbs_api",
        externalId: "SPSaEAAAQBAJ",
        source: "google",
        autorId: 15,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 25,
        nombre: "El Club del Crimen de los Jueves",
        sinopsis: "<p> <b>Descubre la novela que ha inspirado la nueva película de Netflix. Producida por Steven Spielberg y con un reparto liderado por Helen Mirren y Pierce Brosnan. ¿Listo para unirte al club?</b> </p> <p>En un pacífico complejo privado para jubilados, cuatro improbables amigos se reúnen una vez a la semana para revisar antiguos casos de asesinatos locales que quedaron sin resolver. Ellos son Ron, un exactivista socialista lleno de tatuajes y revolución; la dulce Joyce, una viuda que no es tan ingenua como aparenta; Ibrahim, un antiguo psiquiatra con una increíble capacidad de análisis, y la tremenda y enigmática Elizabeth, que, a sus 81 años, lidera el grupo de investigadores aficionados... o no tanto.</p> <p>Cuando un promotor inmobiliario de la zona es hallado muerto con una misteriosa fotografía junto al cuerpo, El Club del Crimen de los Jueves se encuentra en medio de su primer caso real. Aunque sean octogenarios, los cuatro amigos guardan algunos trucos en la manga.</p> <p> <b>¿Podrá este grupo poco ortodoxo pero brillante atrapar al asesino?</b> </p> <p> <b>No subestimes el talento de un grupo de abuelos.</b> <b> <b> </p> <p> <p> <b> </p> <p> <b>Los lectores dicen:</b> </p> <p>«Entrañable, entretenidísima y divertida.»</p> <p>«Con tanto ritmo que pasa volando.»</p> <p>«Fácil, divertida... a ratos tierna, a ratos irónica.» </p> <p>«No voy a dejar de recomendarlo a todos mis amigos.»</p> <p>«Me recuerda a Miss Marple de Agatha Christie.»</p> <p>",
        imagen: "http://books.google.com/books/publisher/content?id=6OnzDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE723d2sLGyI-APqoEqZhgxy3QuGm4JA1hgzleNKgjBAskvmFPHGBEgJzG3f19KBlQ71xda-8tvKAqW3pneas8BKL76V3ZNk_GxfcoiljpHPD78Ll47IdXjGJZnv8H30Xb5bSw466&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=6OnzDwAAQBAJ&source=gbs_api",
        externalId: "6OnzDwAAQBAJ",
        source: "google",
        autorId: 16,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 26,
        nombre: "El jueves siguiente",
        sinopsis: "<p> <b>Resolver un nuevo asesinato no formaba parte de sus planes de jubilación.</b> </p> <p> <b>Más de 6.000.000 lectores ya se han unido a El Club del Crimen de los Jueves.</b> </p> <p>Elizabeth, Joyce, Ron e Ibrahim, los cuatro miembros del Club del Crimen de los Jueves, todavía están celebrando haber resuelto su primer caso de asesinato. Con el barullo de la investigación ya a sus espaldas, se preparan para una merecida temporada de descanso y relajación en Cooper's Chase, su elegante comunidad de jubilados. Pero parece que no va a haber suerte porque pocos días después llegará una visita inesperada: un viejo amigo de Elizabeth ha cometido un peligroso error, está en serios apuros, y ha acudido a ella como último recurso. Su historia incluye unos diamantes robados, un mafioso volátil e impaciente y una amenaza muy real a su vida.</p> <p> <b>Resolver un nuevo asesinato no formaba parte de sus planes de jubilación. </b> </p>",
        imagen: "http://books.google.com/books/publisher/content?id=ZKY4EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70nAhCODQyZSvxAKYHg9_8W-6mChct85aYcPAtJCr0V_FpTqv9DnYjqt8Qb_KFLiUifxnVb7chKdk8RZxO3LhzdXPOao6Lovlg05HJXPbBeHUH2PnYatLl56tbTCzqrqo2vaIHC&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=ZKY4EAAAQBAJ&source=gbs_api",
        externalId: "ZKY4EAAAQBAJ",
        source: "google",
        autorId: 16,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 27,
        nombre: "El último en morir",
        sinopsis: "<p> <b>La esperada nueva entrega de El Club del Crimen de los Jueves, la serie de los abuelos investigadores que ha cautivado a 11.000.000 de lectores.</b> </p> <p>Es Navidad en el complejo residencial de Cooper's Chase y todos esperan disfrutar de unos días de descanso en buena compañía. Pero si eres miembro del Club del Crimen de los Jueves, nunca hay un momento de sosiego. Cuando reciben la noticia de que un viejo amigo ha sido asesinado mientras custodiaba un peligroso paquete, el cuarteto de detectives aficionados se lanza a resolver el misterio.</p> <p>Su búsqueda los lleva a una tienda de antigüedades, donde pronto descubren que los secretos que esconde este oficio son tan antiguos como los objetos mismos. Mientras se cruzan con falsificadores de arte, traficantes de droga y estafadores, Elisabeth, Joyce, Ron e Ibrahim no saben en quién pueden confiar. Con el número de cadáveres rápidamente en aumento, el tiempo en contra y el peligro pisándoles los talones, ¿se les habrá acabado la suerte a nuestros intrépidos investigadores? </p> <p>Bienvenidos a...EL ÚLTIMO EN MORIR.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=C_fNEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70lxD9Tm8QznHFocYQ1fz8byTSgOrHENknaYr2SuuDdQFJ4Ydcm5_aKFommLd1Uq_KRksraYNU1rU9x363kuxuT7E0x-4iIx8p2b5oDCkmPoH7s8Zwix4Um7UbIspZd9tP5Wj7p&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=C_fNEAAAQBAJ&source=gbs_api",
        externalId: "C_fNEAAAQBAJ",
        source: "google",
        autorId: 16,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 28,
        nombre: "Harry Potter y la piedra filosofal",
        sinopsis: "<p>Con las manos temblorosas, Harry le dio la vuelta al sobre y vio un sello de lacre púrpura con un escudo de armas: un león, un águila, un tejón y una serpiente, que rodeaban una gran letra H.<br><br>Harry Potter nunca había oído nada sobre Hogwarts cuando las cartas comienzan a caer en el felpudo del número cuatro de Privet Drive. Escritas en tinta verde en un pergamino amarillento con un sello morado, sus horribles tíos las han confiscado velozmente. En su undécimo cumpleaños, un hombre gigante de ojos negros llamado Rubeus Hagrid aparece con una noticia extraordinaria: Harry Potter es un mago y tiene una plaza en el Colegio Hogwarts de Magia y Hechicería. ¡Una aventura increíble está a punto de empezar!<br><br>Esta edición está traducida al castellano. Existe otra edición disponible para los lectores de español latinoamericano.<br><br><br><i>Tema musical compuesto por James Hannigan.</i></p>",
        imagen: "http://books.google.com/books/content?id=2zgRDXFWkm8C&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72VbTHhbdJKf5e3hdqRMqJzPy-AE1GR-3mMfZMoXBlp99p7zIRVDM1sb0BJiR3Szp16Npr2qpJ2O4L456terfzvyRapdyS9X8sZ6k2AEmsoBfF3DjFh-gg7MVaFUg__k-iRgBrP&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=2zgRDXFWkm8C&source=gbs_api",
        externalId: "2zgRDXFWkm8C",
        source: "google",
        autorId: 17,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 29,
        nombre: "Harry Potter y la cámara secreta",
        sinopsis: "<p>«Hay una conspiración, Harry Potter. Una conspiración para hacer que este año sucedan las cosas más terribles en el Colegio Hogwarts de Magia y Hechicería.»<br><br>El verano de Harry Potter ha incluido el peor cumpleaños de su vida, unos presagios muy poco halagüeños por parte de un elfo doméstico llamado Dobby y ser rescatado de casa de los Dursleys por su amigo Ron Weasley en un coche mágico volador. Cuando regresa al Colegio Hogwarts de Magia y Hechicería para cursar su segundo año, Harry escucha susurros extraños por los pasillos vacíos del colegio... Y luego comienzan los ataques. Se encuentran a estudiantes convertidos en piedra... Los terribles presagios de Dobby parecen hacerse realidad.<br><br>Esta edición está traducida al castellano. Existe otra edición disponible para los lectores de español latinoamericano.<br><br><i>Tema musical compuesto por James Hannigan.</i></p>",
        imagen: "http://books.google.com/books/content?id=zl13g5uRM4EC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE735hbVDDKcXWrUTaCbB6E0Gaqbixfr8ZgIyEliBtNRU7DasUopwhDmpkoan7UTQf9s47YtydxbOSbo_v2359bszPR6Swlng1TuxJJaUr7My3LSSP7RrOpBKgE7VKHVXDHnAb8GJ&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=zl13g5uRM4EC&source=gbs_api",
        externalId: "zl13g5uRM4EC",
        source: "google",
        autorId: 17,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 30,
        nombre: "Harry Potter y el prisionero de Azkaban",
        sinopsis: "During his third year at Hogwarts School for Witchcraft and Wizardry, Harry Potter must confront the devious and dangerous wizard responsible for his parents' deaths.",
        imagen: "http://books.google.com/books/content?id=N-HcPAAACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73ThRzEW-Ug15SG2yloQ534FZlVDr-ymhKFhPym-reYVBavualJS2WnF_9N3bGnAFJhVZeHUPOa9ICBiqfvsOXtoyPuWG5f2DWFHa5JfJBXBeJ_2_4jvsYINCytpQcGfheyt3Wu&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=N-HcPAAACAAJ&source=gbs_api",
        externalId: "N-HcPAAACAAJ",
        source: "google",
        autorId: 18,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 31,
        nombre: "Harry Potter y el cáliz de fuego",
        sinopsis: "<p>«Habrá tres pruebas, espaciadas en el curso escolar, que medirán a los campeones en muchos aspectos diferentes: sus habilidades mágicas, su osadía, sus dotes de deducción y, por supuesto, su capacidad para sortear el peligro.»<br><br>El Torneo de los Tres Magos se va a celebrar en Hogwarts. Solo los magos mayores de diecisiete años pueden participar, pero eso no impide a Harry fantasear con la posibilidad de ganar la competición. Tiempo después, en Halloween, el Cáliz de Fuego elige a los competidores y Harry se asombra al descubrir que su nombre está entre los elegidos por la copa mágica. Se enfrentará a tareas mortales, dragones y magos oscuros, pero con la ayuda de sus mejores amigos, Ron y Hermione, ¡puede que consiga salir vivo de esta!<br><br>Esta edición está traducida al castellano. Existe otra edición disponible para los lectores de español latinoamericano.<br><br><i>Tema musical compuesto por James Hannigan.</i></p>",
        imagen: "http://books.google.com/books/content?id=R2daemCCiF8C&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70htrkacfBsc9hAtJgKMRbuF3j1IYMjZCheEVq74Nov41fSaEV0Eoc7NQyiiA0yNUq8KKtQZTS998ziNXe7e4KWF2Sawi8d8wCpL1inM70nuq6_aVRqQJzMoMK8-l-CWxxvQBus&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=R2daemCCiF8C&source=gbs_api",
        externalId: "R2daemCCiF8C",
        source: "google",
        autorId: 17,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 32,
        nombre: "Harry Potter y la Orden del Fénix",
        sinopsis: "<p>«Compartes los pensamientos y las emociones con el Señor Tenebroso. El director cree que no es conveniente que eso continúe ocurriendo. Quiere que te enseñe a cerrar tu mente al Señor Tenebroso.»<br><br>La oscuridad se ciñe sobre Hogwarts. Tras el ataque de los dementores a su primo Dudley, Harry Potter sabe que Voldemort no se detendrá ante nada hasta dar con él. Hay muchos que niegan la vuelta del Señor Tenebroso, pero Harry no está solo: una orden secreta se reúne en Grimmauld Place para luchar contra las fuerzas oscuras. Harry debe permitir que el profesor Snape le enseñe a protegerse contra los brutales ataques de Voldemort a su mente. Pero cada día son más fuertes y Harry se está quedando sin tiempo...<br><br>Esta edición está traducida al castellano. Existe otra edición disponible para los lectores de español latinoamericano.<br><br><i>Tema musical compuesto por James Hannigan.</i></p>",
        imagen: "http://books.google.com/books/content?id=uUOBPgXQtvUC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72VHPK5Ojy4IftKpQe9P6oDU1TfyGRV09sSndNXuEQABfixr0MHaHEuGHlQyk8eZye5hDHBD9zA_RqqNEAraW0LJGhp8IvuNiFOwnYLzIQVjWVm2WchX9SiEbNMLvODrukRxO9L&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=uUOBPgXQtvUC&source=gbs_api",
        externalId: "uUOBPgXQtvUC",
        source: "google",
        autorId: 17,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 33,
        nombre: "Harry Potter y el misterio del príncipe / Harry Potter and the Half-Blood Prince",
        sinopsis: "<b><i>Harry Potter y el misterio del príncipe</i> es la sexta novela de la ya clásica serie fantástica de la autora británica J.K. Rowling.<br><br></b>Con dieciséis años cumplidos, Harry inicia el sexto curso en Hogwarts en medio de terribles acontecimientos que asolan Inglaterra. Elegido capitán del equipo de quidditch, los ensayos, los exámenes y las chicas ocupan todo su tiempo, pero la tranquilidad dura poco.<br><br>A pesar de los férreos controles de seguridad que protegen la escuela, dos alumnos son brutalmente atacados. Dumbledore sabe que se acerca el momento, anunciado por la Profecía, en que Harry y Voldemort se enfrentarán a muerte: «El único con poder para vencer al Señor Tenebroso se acerca... Uno de los dos debe morir a manos del otro, pues ninguno de los dos podrá vivir mientras siga el otro con vida.»<br><br>El anciano director solicitará la ayuda de Harry y juntos emprenderán peligrosos viajes para intentar debilitar al enemigo, para lo cual el joven mago contará con un viejo libro de pociones perteneciente a un misterioso personaje, alguien que se hace llamar Príncipe Mestizo.<br><br><b>ENGLISH DESCRIPTION</b><br><br><b><i>Harry Potter and the Half-Blood Prince</i> is the sixth volume of British author J.K. Rowling’s now classic series of fantasy novels.</b><br> <br>At age sixteen, in the midst of serious events plaguing England, Harry begins his sixth year at Hogwarts.<b> </b>Having been chosen captain of the Quidditch team, practices, tests, and girls are keeping him busy, but that peace and tranquility is short-lived.<br> <br>Despite tight security measures that protect the school, two students are brutally attacked. Dumbledore knows that, as proclaimed in the Prophecy, the time is approaching when Harry and Voldemort must face each other in a deadly match: \"The only one with strong enough powers to defeat the Dark Lord is approaching ... One of the two must die at the hands of the other, because neither can live as long as the other is still alive.”<br> <br>The old Headmaster will enlist Harry's help, and together they will undertake dangerous trips in order to try to weaken the enemy, for this the young wizard will have the help of an old potion book that belonged to a mysterious person, someone who calls himself the Half-Blood Prince.",
        imagen: "http://books.google.com/books/publisher/content?id=olaREAAAQBAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73uzP6FLzIlhXX56GpM2YAJ3wMuw9M2AGbrFzWIFWiBIwbOYCDn8HAKHTxECBlf4IN-XBnkkLl9XwvamfGlWqW0FpfqetZE7V9nu5EAa7lVR_AnHlz1l4BLhreQtqvceiE9GJlW&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=olaREAAAQBAJ&source=gbs_api",
        externalId: "olaREAAAQBAJ",
        source: "google",
        autorId: 17,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 34,
        nombre: "Harry Potter y Las Reliquias de la Muerte (Harry Potter and the Deathly Hallows)",
        sinopsis: "Harry Potter sets out on a final quest to stop his archenemy, the evil Lord Voldemort, with his friends, Ron Weasley and Hermione Granger, before the wizarding world can be destroyed by Voldemort and his Death Eaters.",
        imagen: "http://books.google.com/books/content?id=O4lWzwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73_bpiwDxI74FR7lsnpzMpHEFWvHZlV9r6Fqu9j2d9itsvvr2iCcM10_x_RB4Bm5r_EjuSRh9_e6WPYAyc50nUjrfkyFEDny9FHH2Lm_gOmfKV0D7_BHoeJWfz2eMd7WMzZqpyG&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=O4lWzwEACAAJ&source=gbs_api",
        externalId: "O4lWzwEACAAJ",
        source: "google",
        autorId: 18,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 2,
        nombre: "The Hobbit, Or, There and Back Again",
        sinopsis: "<p>This definitive paperback edition features nine illustrations and two maps drawn by J.R.R. Tolkien, and a preface by Christopher Tolkien.</p> <br> <br> <p>Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely travelling further than the pantry of his hobbit-hole in Bag End. But his contentment is disturbed when the wizard, Gandalf, and a company of thirteen dwarves arrive on his doorstep one day to whisk him away on an unexpected journey 'there and back again'. They have a plot to raid the treasure hoard of Smaug the Magnificent, a large and very dangerous dragon...</p> <p>The prelude to The Lord of the Rings, The Hobbit has sold many millions of copies since its publication in 1937, establishing itself as one of the most beloved and influential books of the twentieth century.</p>",
        imagen: "http://books.google.com/books/content?id=Ts_gmPmzxtUC&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE73Pt2lrTAcounzWLAFGS4xb0xaStKkSjragIny_VFQukSeuXIr32RotNmSCh7LcQKudVhA6ZNVylRjgUqDLDryZThe1ngkzLLtfN_KNizR3okao56euDu5WzhdUMrVVuyjIwQI9&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=Ts_gmPmzxtUC&source=gbs_api",
        externalId: "Ts_gmPmzxtUC",
        source: "google",
        autorId: 9,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-21T00:00:00.000Z")
      },
      {
        id: 35,
        nombre: "El Señor de Los Anillos 1. La Comunidad del Anillo (TV Tie-In) - The Lord of the Rings 1. the Fellow",
        sinopsis: "<p><b>Un héroe inesperado. Una misión peligrosa. La mayor aventura que jamás te hayan contado.</b></p><p><b>La primera entrega de la trilogía de J. R. R. Tolkien El Señor de los Anillos</b></p><p>En la adormecida e idílica Comarca, un joven hobbit recibe un encargo: custodiar el Anillo Único y emprender el viaje para su destrucción en la Grieta del Destino. Acompañado por magos, hombres, elfos y enanos, atravesará la Tierra Media y se internará en las sombras de Mordor, perseguido siempre por las huestes de Sauron, el Señor Oscuro, dispuesto a recuperar su creación para establecer el dominio definitivo del Mal.</p><p><b>«La obra de Tolkien, difundida en millones de ejemplares, traducida a docenas de lenguas, inspiradora de slogans pintados en las paredes de Nueva York y de Buenos Aires... una coherente mitología de una autenticidad universal creada en pleno siglo veinte.» </b>--George Steiner, Le Monde, 1973</p><p></p><p></p><p><b><br></b></p><p><b>ENGLISH DESCRIPTION</b></p><p>Inspired by <b><i>The Hobbit</i></b> and begun in 1937, <b><i>The Lord of the Rings</i></b> is a trilogy that J.R.R. Tolkien created to provide \"the necessary background of history for Elvish tongues\". From these academic aspirations was born one of the most popular and imaginative works in English literature.</p><p>The Fellowship of the Ring, the first volume in the trilogy, tells of the fateful power of the One Ring. It begins a magnificent tale of adventure that will plunge the members of the Fellowship of the Ring into a perilous quest and set the stage for the ultimate clash between the powers of good and evil.</p><p>In this splendid, unabridged audio production of Tolkien's great work, all the inhabitants of a magical universe - hobbits, elves, and wizards - step colorfully into life. Rob Inglis' narration has been praised as a masterpiece of audio.</p>",
        imagen: "http://books.google.com/books/content?id=6sRGzwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70YYZiwd0iWWzS8dzYNr7OajfmZOtIPkIBSfSL9mdBBLUHQ5AS4P5Jy5cIDsmZ6ZAljmXunn7zntJR0eWj9cGsjNisXIaLolaE9RwMhJYYPTmMAVG5g5Ca1N2vAUknSjmKwYxNG&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=6sRGzwEACAAJ&source=gbs_api",
        externalId: "6sRGzwEACAAJ",
        source: "google",
        autorId: 19,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 36,
        nombre: "El señor de los anillos",
        sinopsis: "<p><b>La misión parece abocada al fracaso pero la aventura continua...</b></p> <p>La Compañía se ha disuelto y sus integrantes emprenden caminos separados. Frodo y Sam continúan solos su viaje a lo largo del río Anduin, perseguidos por la sombra misteriosa de un ser extraño que también ambiciona la posesión del Anillo. Mientras, hombres, elfos y enanos se preparan para la batalla final contra las fuerzas del Señor del Mal.</p> <p><b>ENGLISH DESCRIPTION</b></p> <p><b>The Two Towers is the second volume of J.R.R. Tolkien's epic saga, The Lord of the Rings.</b></p> <p>The Fellowship has been forced to split up. Frodo and Sam must continue alone towards Mount Doom, where the One Ring must be destroyed. Meanwhile, at Helm's Deep and Isengard, the first great battles of the War of the Ring take shape.</p> <p>In this splendid, unabridged audio production of Tolkien's great work, all the inhabitants of a magical universe - hobbits, elves, and wizards - spring to life. Rob Inglis' narration has been praised as a masterpiece of audio.</p>",
        imagen: "http://books.google.com/books/content?id=CWtHzwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72NerMIkFQir9YzLiJYC3vqH2IRj5xp_fxtmb1WbZvZfBvMHvwH-Jt7R7L9HIfR-mwI4OwmYNspcVPZyebi1IzmVBgiFs2TaRx3XWqtsMmvB5fd7dKNg8Ubk9eCjpcleiHsFoZZ&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=CWtHzwEACAAJ&source=gbs_api",
        externalId: "CWtHzwEACAAJ",
        source: "google",
        autorId: 20,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 37,
        nombre: "El señor de los anillos",
        sinopsis: "\"Los ejércitos del Señor Oscuro van extendiendo cada vez más su maléfica sombra por la Tierra Media. Hombres, elfos y enanos unen sus fuerzas para presentar batalla a Sauron y sus huestes. Ajenos a estos preparativos, Frodo y Sam siguen adentrándose en el país de Mordor en su heroico viaje para destruir el Anillo de Poder en las Grietas del Destino.\" --",
        imagen: "http://books.google.com/books/content?id=e1ZJzwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70Ghu_4AMuGbmtwBwl5SI8Q9SQNoRMAxeMRuVoB5Gn2HrHC7GAzPk3ykPmKHZGG1PW4eDi2vrY3hGFVqQ1knhKSqijYqaA2Qvt9gMwXkjdKkp1yAdrqibf5B1wRyrAF-IE46w7W&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=e1ZJzwEACAAJ&source=gbs_api",
        externalId: "e1ZJzwEACAAJ",
        source: "google",
        autorId: 20,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 38,
        nombre: "El Silmarillion (Edición Revisada) / The Silmarillion (Revised Edition)",
        sinopsis: "<p><b>Edición revisada del clásico Silmarillion del gran J. R. R. Tolkien. </b></p> <p>El Silmarillion cuenta la historia de la Primera Edad, el antiguo drama del que hablan los personajes de El Señor de los Anillos, y en cuyos acontecimientos algunos de ellos tomaron parte, como Elrond y Galadriel... Una obra de auténtica imaginación, una visión inspirada, legendaria o mítica, del interminable conflicto entre el deseo de poder y la capacidad de crear.</p> <p>«Invitado a que se lo compare con las mitologías inglesas, alcanza la grandeza de un auténtico mito.»<br> --Financial Times</p> <p>«Asombra que un solo hombre, en poco más de medio siglo de trabajo, haya llegado a convertirse en el equivalente creativo de todo un pueblo.»<br> --The Guardia</p>",
        imagen: "http://books.google.com/books/content?id=Flp5zwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72-dy5u1chMX2p1Ove41VMOqxuMt31qjg3wtQnAZ0STOJJ4zJ1vgyCA8gcpnpa4JEOAbT0knkTUoZRFtnh-jGw_nw2k8HnANoeRMei_rwsWBHx0xSuWyJdAZVpVwJ_DxjY5mLY3&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=Flp5zwEACAAJ&source=gbs_api",
        externalId: "Flp5zwEACAAJ",
        source: "google",
        autorId: 20,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 39,
        nombre: "Cuentos Inconclusos (Edición Revisada).",
        sinopsis: "<p><b>Edición revisada de los <i>Cuentos Inconclusos</i> de J. R. R. Tolkien.</b></p><p><b><i> <p>Cuentos Inconclusos</i></b> <b>es una colección de relatos sobre la Historia de la Tierra Media </b>desde los Primeros Días hasta el fin de la Guerra del Anillo, pasando por la Segunda Edad y el levantamiento de Sauron, en los que se refieren sucesos que más adelante se narrarán en <i>El Silmarillion</i> y en <i>El Señor de los Anillos</i>.</p><p> <p>El libro se concentra en el territorio de la Tierra Media, y comprende elementos tales como el animado discurso en que Gandalf explica cómo llegó a enviar a los Enanos a la famosa reunión en Bolsón Cerrado; la emergencia de Ulmo, el dios del mar, ante los ojos de Tuor en la costa de Beleriand; una descripción detallada de la organización militar de los Jinetes de Rohan; y el viaje de los Jinetes Negros durante la búsqueda del Anillo.</p> <p>Cuentos Inconclusos también contiene el único relato que se conserva sobre el extenso pasado, anterior a su caída, de Númenor, y todo lo que se sabe sobre los Cinco Magos, las Palantíri y la leyenda de Amroth.<p></p><b> <p>ENGLISH DESCRIPTION</b><p></p><b><i> <p>The Fall of Númenor</i>...</b> <b>is a collection of stories about the History of Middle-earth</b> from the First Days to the end of the War of the Ring, through the Second Age and the rise of Sauron, in which events are related that will later be narrated in <i>The Silmarillion</i> and <i>in The Lord of the Rings</i>.<p></p><p> <p>The book concentrates on the territory of Middle-earth, and includes such elements as the lively speech in which Gandalf explains how he came to send the Dwarves to the famous meeting in Baggins End; the emergence of Ulmo, the god of the sea, before Tuor's eyes on the coast of Beleriand; a detailed description of the military organization of the Riders of Rohan; and the journey of the Black Riders during the search for the Ring.</p><i> <p>The Fall of Númenor...</i> also contains the only surviving account of Númenor's extensive past, prior to his fall, and all that is known about the Five Magi, the Palantíri, and the legend of Amroth.<p></p> <p><br>",
        imagen: "http://books.google.com/books/content?id=2MI8zwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE723dHFDWoE36WPN24blQW4xebsCDTXsZvg1O2WBMLYZlosyko0SSHh9mYr6kAyelb1CaTz0W5kzkeWdiGark1UwqsZF5CPyrQ3Of_95IHmGq6D_TO_k05P1s1SOvv9vxF5zRTcX&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=2MI8zwEACAAJ&source=gbs_api",
        externalId: "2MI8zwEACAAJ",
        source: "google",
        autorId: 19,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 40,
        nombre: "Los Hijos de Húrin / The Children of Hurin",
        sinopsis: "<p><b>El origen de la Tierra Media</b></p><p>Situada en la Primera Edad, cuando elfos, hombres y enanos llevaban pocos siglos sobre la tierra. <b>La última novela de Tolkien</b> narra una historia trágica de amores imposibles, pasiones y guerras sin cuartel entre la Luz y la Oscuridad, mientras hombres, elfos, enanos, orcos y dragones luchaban por el dominio de la Tierra Media. </p><b> <p>ENGLISH DESCRIPTION</b><p></p> <p><p><b>The origin of Middle-earth</b></p><p>Located in the First Age, when elves, men and dwarves had only been on earth for a few centuries. <b>Tolkien's latest novel</b> tells a tragic story of impossible loves, passions and merciless wars between Light and Darkness, as men, elves, dwarves, orcs and dragons fought for dominance of Middle-earth.</p><b><br></b>",
        imagen: "http://books.google.com/books/content?id=MddsrgEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72ILi4sAuFI46xI4wuwVzItBsQKeV1lbtk7Cp1JBMa2ljWNEpru8uSoX1ykiBhkHoSenXaFGtmFCx7R5caZOmrMXvF15H27QUQsLQTivjmjcLyBAlAlkj4pjlQptWKJIgsuduNS&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=MddsrgEACAAJ&source=gbs_api",
        externalId: "MddsrgEACAAJ",
        source: "google",
        autorId: 19,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 41,
        nombre: "Beren y Lúthien",
        sinopsis: "<p> <b>Una historia de amor fantástico del creador de la Tierra Media.</b> </p> <p>El relato de Beren y Lúthien era, o se convirtió, en un elemento esencial en la evolución de El Silmarillion, los mitos y leyendas de la Primera Edad del Mundo concebidos por J. R. R. Tolkien. El autor escribió el relato durante el año siguiente a su regreso de Francia y de la batalla del Somme a finales de 1916.</p> <p>Esencial para la historia y sin haber sido nunca alterado, el elemento central del relato es el destino que ensombrece el amor de Beren y Lúthien, dado que Beren era un hombre mortal y Lúthien una Elfa inmortal, cuyo padre, un gran señor Elfo, en clara oposición a Beren, impuso a éste una tarea imposible que debía llevar a cabo si quería desposar a Lúthien. Éste es el núcleo de la leyenda, que acaba conduciendo al absolutamente heroico intento de Beren y Lúthien de robarle un Silmaril al más malvado de todos los seres: Melkor, también llamado Morgoth, el Enemigo Oscuro.</p> <p>En este libro Christopher Tolkien ha intentado extraer la historia de Beren y Lúthien de la extensa obra en la cual estaba entretejida. Para ilustrar una parte del proceso a través del cual este «Gran Relato» de la Tierra Media evolucionó a través de los años, Christopher ha narrado la historia en palabras de su padre ofreciendo, en primer lugar, su forma original, y a continuación pasajes en prosa y verso de textos posteriores que ilustran cómo ha cambiado la narrativa. </p>",
        imagen: "http://books.google.com/books/publisher/content?id=9EJMDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71GaS6bPABtdxJLFowHi5AMfT1Kf1wzl6IrXab9wc7yCvaGo_skoabtu8dP8lPeHlHMttSRv-l5BBEOKokJORYp8dRqGahjos8pedaf4SPN8PliQVb2bI5DjdF2dtKf8ZlA6eV9&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=9EJMDwAAQBAJ&source=gbs_api",
        externalId: "9EJMDwAAQBAJ",
        source: "google",
        autorId: 19,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 42,
        nombre: "La Caída de Gondolin",
        sinopsis: "<p> <b>Un gran relato de la Tierra Media de Tolkien.</b> </p> <p>En el Cuento de La Caída de Gondolin chocan dos de los principales poderes del mundo. Por un lado está Morgoth, el mal más absoluto, que está al mando de un enorme poder militar que controla desde su fortaleza en Angband. En su oposición está Ulmo, el segundo Vala más poderoso. Trabaja secretamente en la Tierra Media para apoyar a los Noldor, el grupo de elfos entre los que se contaban Húrin y Túrin Turambar.</p> <p>En el centro de este conflicto entre deidades se encuentra la ciudad de Gondolin, bella pero escondida más allá de toda posibilidad de ser descubierta. Fue construida y habitada por elfos Noldor que se rebelaron contra el poder divino y huyeron desde Valinor, la tierra de los dioses, a la Tierra Media. Turgon, el rey de Gondolin, es el principal objeto tanto del odio como el miedo de Morgoth, quien trata en vano de descubrir la ciudad, escondida como por arte de magia. En este mundo entra Tuor, el primo de Túrin, como instrumento para hacer cumplir los planes de Ulmo. Guiado por el dios desde la invisibilidad, Tuor parte de la tierra donde nació y emprende un peligroso viaje en busca de Gondolin.</p> <p>En uno de los momentos más fascinantes de la historia de la Tierra Media, Ulmo se persona ante él, emergiendo del mar en medio de una tormenta. En Gondolin Tuor madura; se casa con Idril, y tienen a su hijo Eärendel. Después llega el terrible final. Debido a un acto de traición suprema, Morgoth se entera de cómo lanzar un ataque devastador a la ciudad, valiéndose de balrogs, dragones e incontables orcos.</p> <p>En este libro Christopher Tolkien ha intentado extraer la historia de La Caída de Gondolin de la extensa obra en la cual estaba entretejida. Para ilustrar una parte del proceso a través del cual este «Gran Relato» de la Tierra Media evolucionó a través de los años, Christopher ha narrado la historia en palabras de su padre.</p>",
        imagen: "http://books.google.com/books/publisher/content?id=fv6EDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70nUS1quw3Dpx8KPdyM5_nXgIUNhJXo8wdOhTb_wkI-RC2CuzB52pPvLX9wRcDhDCL7H1hoHfmrHldgEKk6uq4t_aPzpeS2HRG-WFz9CPazHiv4HSEplRJ0uDZ3VeTZ6Hf-y2hQ&source=gbs_api",
        enlace: "https://play.google.com/store/books/details?id=fv6EDwAAQBAJ&source=gbs_api",
        externalId: "fv6EDwAAQBAJ",
        source: "google",
        autorId: 19,
        categoriaId: null,
        editorialId: null,
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
    ],
    sagas: [
      {
        id: 1,
        nombre: "Serie Empíreo",
        libroIds: [6, 7, 8],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 2,
        nombre: "La Saga de los Longevos",
        libroIds: [9, 10, 11],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 3,
        nombre: "Serie Pecados",
        libroIds: [12, 13, 14, 15],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 4,
        nombre: "Serie Twisted",
        libroIds: [16, 17, 18, 19],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 5,
        nombre: "Serie Asesinato para principiantes",
        libroIds: [20, 21, 22],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 6,
        nombre: "Bilogía Romper el círculo",
        libroIds: [23, 24],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 7,
        nombre: "Serie El club del crimen de los jueves",
        libroIds: [25, 26, 27],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 8,
        nombre: "Saga Harry Potter",
        libroIds: [28, 29, 30, 31, 32, 33, 34],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
      {
        id: 9,
        nombre: "El Señor de los Anillos",
        libroIds: [2, 35, 36, 37, 38, 39, 40, 41, 42],
        createdAt: new Date("2025-10-29T00:00:00.000Z")
      },
    ]
    };

    // Crear entidades si no existen
    console.log('Creando autores...');
    for (const autorData of masterData.autores) {
      const existing = await em.findOne(Autor, { nombre: autorData.nombre, apellido: autorData.apellido });
      if (!existing) {
        const autor = em.create(Autor, {
          nombre: autorData.nombre,
          apellido: autorData.apellido,
          createdAt: autorData.createdAt
        });
        await em.persistAndFlush(autor);
        console.log(`Autor creado: ${autor.nombre} ${autor.apellido}`);
      }
    }

    // No categorías o editoriales en los datos maestros

    console.log('Creando libros...');
    for (const libroData of masterData.libros) {
      const existing = await em.findOne(Libro, { nombre: libroData.nombre });
      if (!existing) {
        const autor = libroData.autorId ? await em.findOne(Autor, { id: libroData.autorId }) : null;
        const categoria = libroData.categoriaId ? await em.findOne(Categoria, { id: libroData.categoriaId }) : null;
        const editorial = libroData.editorialId ? await em.findOne(Editorial, { id: libroData.editorialId }) : null;

        const libro = em.create(Libro, {
          nombre: libroData.nombre,
          sinopsis: libroData.sinopsis,
          imagen: libroData.imagen,
          enlace: libroData.enlace,
          externalId: libroData.externalId,
          source: libroData.source,
          autor: autor,
          categoria: categoria,
          editorial: editorial,
          createdAt: libroData.createdAt
        });
        await em.persistAndFlush(libro);
        console.log(`Libro creado: ${libro.nombre}`);
      }
    }

    console.log('Creando sagas...');
    for (const sagaData of masterData.sagas) {
      const existing = await em.findOne(Saga, { nombre: sagaData.nombre });
      if (!existing) {
        const libros = await em.find(Libro, { id: { $in: sagaData.libroIds } });

        const saga = em.create(Saga, {
          nombre: sagaData.nombre,
          createdAt: sagaData.createdAt
        });
        saga.libros.set(libros);
        await em.persistAndFlush(saga);
        console.log(`Saga creada: ${saga.nombre} con ${libros.length} libros`);
      }
    }

    console.log('Master data creado exitosamente!');
  } catch (error) {
    console.error('Error creando master data:', error);
  } finally {
    await orm.close();
  }
})().catch((err) => {
  console.error(err);
});
