import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const title = typeof body?.title === 'string' ? body.title.trim() : 'Lagu Harkat'
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    const styles = typeof body?.styles === 'string' ? body.styles.trim() : 'Pop Indonesia'

    // Template lirik cerdas berbasis tema & genre Indonesia
    const isDangdut = /dangdut|koplo|tarling|kendang/i.test(styles + prompt)
    const isRock = /rock|distorsi|energetik/i.test(styles + prompt)
    const isSad = /sedih|galau|melancholic|perpisahan|tinggal/i.test(prompt + title)

    let lyrics = ''

    if (isDangdut) {
      lyrics = `[Intro]
Kendang berirama, nada koplo membara

[Verse 1]
Dulu kau berjanji setia selamanya
Nyatanya kau pergi tinggalkan luka
Kini ku bernyanyi lepaskan duka
Biar musik kendang hibur hatiku

[Pre-Chorus]
Kandas sudah cerita kita
Tak kan lagi ku meneteskan air mata

[Chorus]
Hore-hore koplo bergoyang
Lupakan semua kenangan hilang
Biar ku sendiri tetap tenang
Tersenyum menyambut hari yang terang

[Verse 2]
Kupetik senar di malam sunyi
Kupukul kendang hilangkan sepi
Kini ku bebas tanpa beban diri
Menatap esok bersinar lagi

[Chorus]
Hore-hore koplo bergoyang
Lupakan semua kenangan hilang
Biar ku sendiri tetap tenang
Tersenyum menyambut hari yang terang

[Outro]
Asyik bergoyang...
Sampai jumpa masa lalu!`
    } else if (isRock) {
      lyrics = `[Intro - Guitar Riff]

[Verse 1]
Langkah kaki terhempas debu jalanan
Biar badai menghadang tak kan mundur perlahan
Suara di dalam dada terus berteriak
Kemenangan adalah janji yang tegak

[Pre-Chorus]
Tak ada kata menyerah
Bakar jiwa yang sempat patah!

[Chorus]
Kobarkan api di dalam jiwa
Hancurkan dinding penghalang asa
Kita berdiri di atas dunia
Bersama teriak lantang merdeka!

[Verse 2]
Rantai keraguan kini terputus
Jalan kemenangan terbuka lurus
Biarkan distorsi gemuruh bersuara
Menemani langkah pejuang rasa

[Chorus]
Kobarkan api di dalam jiwa
Hancurkan dinding penghalang asa
Kita berdiri di atas dunia
Bersama teriak lantang merdeka!

[Guitar Solo]

[Outro]
Terbang tinggi tanpa batas!`
    } else if (isSad) {
      lyrics = `[Intro - Piano Melancholy]

[Verse 1]
Malam hening menatap bayangmu yang pudar
Semua cerita manis perlahan buyar
Kau pilih melangkah bersama yang lain
Meninggalkan hatiku tertusuk dingin

[Pre-Chorus]
Mengapa janji begitu mudah sirna?
Saat ku titipkan seluruh rasa...

[Chorus]
Kini kau bahagia di pelukannya
Tapi tidak hidupku yang tersiksa
Kucoba tersenyum di hadapan dunia
Meski di dalam jiwa terluka parah

[Verse 2]
Hujan jatuh hapus jejak langkahmu
Namun tak bisa hapus semua rinduku
Kuikhlaskan kau pergi mengejar angan
Walau ku tertinggal dalam kesendirian

[Chorus]
Kini kau bahagia di pelukannya
Tapi tidak hidupku yang tersiksa
Kucoba tersenyum di hadapan dunia
Meski di dalam jiwa terluka parah

[Bridge]
Waktu kan sembuhkan luka ini
Meski butuh seribu malam sepi...

[Chorus]
Kini kau bahagia di pelukannya
Tapi tidak hidupku yang tersiksa
Kucoba tersenyum di hadapan dunia
Meski di dalam jiwa terluka parah

[Outro]
Selamat jalan...
Biarkan ku sendiri sembuhkan luka.`
    } else {
      lyrics = `[Intro]

[Verse 1]
Pagi menyapa membawa asa baru
Menyinari mimpi yang sempat tertidur
Langkah kaki melangkah dengan pasti
Menatap cakrawala indah berseri

[Pre-Chorus]
Bersama kita bisa lewati masa
Jadikan mimpi nyata terbentang rasa

[Chorus]
Terbang tinggi menggapai bintang
Bawa harapan bersinar terang
Jangan pernah takut kan bayang
Karna cinta selalu kan menang

[Verse 2]
Setiap nada merangkai cerita
Tentang perjalanan penuh makna
Tangan bergandeng seirama melodi
Harmoni abadi di dalam sanubari

[Chorus]
Terbang tinggi menggapai bintang
Bawa harapan bersinar terang
Jangan pernah takut kan bayang
Karna cinta selalu kan menang

[Outro]
Harmoni abadi...
Selamanya di hati.`
    }

    return NextResponse.json({
      title: title || 'Lagu Harkat',
      lyrics,
      structure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Outro'],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal menghasilkan lirik' },
      { status: 500 }
    )
  }
}
