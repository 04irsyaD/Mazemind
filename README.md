# MazeMind

MazeMind adalah game browser first-person psychological office horror yang menggabungkan eksplorasi, puzzle maze, dan escape-game pacing. Pemain berperan sebagai pegawai kantor yang sendirian menyelesaikan tugas-tugas departemen, lalu perlahan menyadari bahwa bangunan tersebut salah, artifisial, dimanipulasi, dan tidak sepenuhnya dibuat untuk manusia.

Game ini bukan maze acak biasa, bukan jumpscare horror, bukan combat game, dan bukan neon cyberpunk action. MazeMind diarahkan sebagai pengalaman atmosferik: sepi, menekan, membingungkan secara sengaja, dan dibangun melalui arsitektur kantor yang terasa realistis namun semakin tidak masuk akal.

## Status Proyek

Project saat ini berada pada tahap rekonstruksi fondasi identitas dan sistem.

Yang sudah ada:

- FPS browser berbasis Three.js.
- Level kantor retro-futuristik dengan ruang makro: entry, orientation hub, cubicle sector, archive, review chamber, wrong department, fake exit, dan final route.
- Movement FPS dengan akselerasi, deselerasi, wall sliding, delta clamp, dan floor-height sampling.
- Sistem collision grid plus authored prop collision volumes.
- Progression system untuk task, fake exit, crusher arming, final route unlock, dan completion.
- Runtime level loader agar `Game` tidak lagi mem-spawn semua entity secara manual.
- Lighting system untuk fluorescent office lighting, AI cyan channel, emergency channel, dan flicker halus.
- Department control foundation untuk route lock, signage manipulation, dan lighting manipulation.
- Minimal ambient audio foundation: office hum dan ventilation noise.
- Developer Explore tools untuk fly mode, collision view, room labels, route graph, crusher path, state inspector, dan light channel inspection.

## Target Pengalaman

Emotional core:

> Seorang pekerja kantor kesepian mencoba menyelesaikan tugas di gedung departemen yang perlahan menunjukkan bahwa ruang tersebut dimanipulasi, artifisial, dan bukan departemennya.

Prioritas desain:

1. Atmosfer
2. Identitas game
3. Perasaan pemain
4. Kenyamanan FPS
5. Keterbacaan ruang
6. Arsitektur kantor yang believable
7. Horror yang subtle
8. Stabilitas browser
9. Skalabilitas AI/environment manipulation

Hal yang sengaja dihindari:

- Jumpscare
- Gore realistis
- Combat/action horror
- Neon/RGB overload
- Maze random tanpa makna
- Visual spam
- Navigasi yang membuat motion sickness

## Referensi Arah Desain

Visual:

- Inside
- Control

Gameplay:

- Portal
- Pacman horror mode

Atmosfer:

- Backrooms
- Lethal Company

Interpretasi untuk MazeMind:

- Minimalis, cinematic, dan spatially readable.
- Office architecture yang masuk akal dulu, baru kemudian dibuat salah.
- Tension dari kesunyian, jarak pandang, ruang kosong, signage yang keliru, rute yang berubah, dan fake exits.
- AI antagonist hadir sebagai sistem lingkungan, bukan monster fisik.

## Struktur Folder

```text
Mazemind/
├─ dist/                  # Output production build Vite
├─ docs/
│  └─ TECHNICAL_AUDIT.md  # Audit root-cause dan arah refactor
├─ frontend/
│  ├─ index.html          # HTML shell aplikasi
│  ├─ package.json        # Script dan dependencies frontend
│  ├─ styles/
│  │  └─ main.css         # UI overlay styling
│  └─ src/
│     ├─ core/            # Runtime core, scene, loader, event bus
│     ├─ entities/        # Player, goal, checkpoint, crusher, props
│     ├─ maps/            # LevelDefinition dan generator office grid
│     ├─ systems/         # Camera, collision, progression, lighting, audio, debug
│     └─ ui/              # UI manager
└─ README.md
```

## Teknologi

- JavaScript ES Modules
- Three.js
- Vite
- Web Audio API
- Browser-only deployment target

Tidak ada backend saat ini. Game berjalan sepenuhnya di browser.

## Cara Menjalankan

Masuk ke folder frontend:

```powershell
cd "C:\Users\ROG\Documents\New project\Mazemind\frontend"
```

Install dependency jika belum:

```powershell
npm install
```

Jalankan dev server:

```powershell
npm run dev
```

Default URL:

```text
http://localhost:5173
```

Build production:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

Output build berada di:

```text
Mazemind/dist/
```

## Kontrol Game

Mode bermain:

- `W A S D` atau arrow keys: bergerak
- Mouse: melihat sekitar
- Klik Start: mengunci pointer
- `Esc`: melepas pointer lock

Developer Explore, hanya aktif saat dev tools enabled:

- `F1`: toggle helper/debug visibility
- `F2`: fly camera
- `F3`: toggle collision
- `F4`: toggle crusher visibility
- `F5`: toggle solid/collision visualization
- `F6`: toggle room identity visualization
- `F7`: toggle route visualization
- `1-5`: teleport ke task/checkpoint
- `0`: teleport ke exit
- `R`: reset ke start
- `Space`: naik saat fly mode
- `Shift`: turun saat fly mode

## Arsitektur Runtime

### Entry Point

`frontend/src/main.js` membuat instance `Game`, menjalankan loop, dan menangani HMR cleanup saat development.

### Game Core

`frontend/src/core/Game.js` mengoordinasikan sistem utama:

- `Scene`
- `InputManager`
- `EntityManager`
- `UIManager`
- `GameStateSystem`
- `LevelRuntime`
- `ProgressionSystem`
- `DepartmentControlSystem`
- `LightingSystem`
- `AudioSystem`
- `DeveloperExploreSystem`

`Game` tetap menjadi orchestrator, tetapi level spawning, progression, lighting, dan manipulation sekarang sudah dipisahkan ke sistem khusus.

### LevelRuntime

`frontend/src/core/LevelRuntime.js` bertanggung jawab untuk:

- Normalisasi `LevelDefinition`
- Build environment melalui `MazeBuilder`
- Build lighting melalui `LightingSystem`
- Build collision melalui `CollisionSystem`
- Spawn objective, hazard, goal, sentient props, dan trap
- Register runtime handles untuk signage, route locks, dan light channels

Tujuannya: `Game` tidak lagi menjadi tempat semua entity dan logic level di-hardcode.

### LevelDefinition

`frontend/src/core/LevelDefinition.js` mendefinisikan normalisasi level.

Level data utama ada di:

```text
frontend/src/maps/level1.js
```

Level sekarang diarahkan sebagai data konseptual, bukan sekadar grid:

- `spaces`
- `connectors`
- `objectives`
- `hazards`
- `lightingZones`
- `storyBeats`
- `manipulationNodes`
- `collisionVolumes`
- `collisionGrid`

Grid tetap ada, tetapi diperlakukan sebagai artifact runtime untuk collision/building, bukan sumber utama desain ruang.

### OfficeMazeGenerator

`frontend/src/maps/OfficeMazeGenerator.js` membuat collision grid dari authored office spaces dan connectors.

Generator ini sengaja dibatasi:

- Tidak membuat random meaningless maze.
- Tidak membuat corridor chaos.
- Hanya mengubah authored office structure menjadi grid runtime.

## Sistem Gameplay

### ProgressionSystem

`frontend/src/systems/ProgressionSystem.js` adalah state machine progression.

State penting:

- `tasksIncomplete`
- `crusherArmed`
- `finalRouteUnlocked`
- `finalRouteEntered`
- `complete`

Fungsi utama:

- Mencatat task yang sudah selesai.
- Mendeteksi fake exit attempt.
- Mengaktifkan crusher state melalui event.
- Membuka final route setelah semua task selesai.
- Menjadi sumber kebenaran untuk apakah final exit boleh menyelesaikan level.

### DepartmentControlSystem

`frontend/src/systems/DepartmentControlSystem.js` adalah fondasi AI antagonist.

AI di MazeMind bukan monster. AI adalah intelligence yang mengontrol departemen.

Sistem ini dapat:

- Lock/unlock route nodes
- Mengubah signage text
- Mengubah lighting channel scale
- Menyimpan fake exits dan loop candidates
- Register runtime handles dari level

Saat ini sistem ini sudah siap dipakai oleh scripted beats berikutnya.

### Crusher

`frontend/src/entities/CrusherWall.js` menangani emergency wall/crusher corridor.

Crusher harus:

- Cinematic
- Readable
- Fair
- Memberi reaction time

Crusher tidak boleh menjadi unavoidable death trap.

### Fake Exit

Fake exit adalah bagian dari psychological navigation.

Jika task belum selesai:

- Exit tampak believable.
- Sistem menolak akses.
- Department dapat mengubah route/signage/lighting.
- Crusher corridor dapat di-arm.

Jika semua task selesai:

- Final route terbuka.
- Exit dapat menyelesaikan level.

## Sistem FPS

### Player

`frontend/src/entities/Player.js`

Fitur movement:

- Acceleration/deceleration
- Delta clamp
- Wall sliding
- Respawn velocity reset
- Floor-height aware position
- Default player light dimatikan agar lighting tetap berasal dari environment

### Camera

`frontend/src/systems/CameraSystem.js`

Fitur camera:

- FPS yaw/pitch
- Mouse delta clamp
- Deterministic camera shake
- Subtle head bob
- Floor-height aware eye position
- Reset yaw/pitch dari level start

### Collision

`frontend/src/systems/CollisionSystem.js`

Collision sekarang mencakup:

- Collision grid
- Capsule-footprint sampling
- Stepped movement
- Static authored prop volumes
- Dynamic route blockers
- Floor-height lookup
- Room lookup

## Sistem Visual Dan Atmosfer

### Scene

`frontend/src/core/Scene.js`

Mengatur:

- Three.js scene
- Perspective camera
- Renderer
- Fog
- Tone mapping
- Shadow map
- Global ambient/hemisphere/directional base lighting
- Resize handling
- Cleanup/dispose

### MazeBuilder

`frontend/src/entities/MazeBuilder.js`

Membangun:

- Walls
- Floors
- Ceiling
- Navigation strips
- Room architecture
- Props kantor
- Signage
- Terminals
- Cubicles
- Server racks
- Glass walls
- Frames
- Door slabs

Lighting point fixtures sudah dipindahkan ke `LightingSystem` agar dapat dikontrol oleh AI/environment state.

### LightingSystem

`frontend/src/systems/LightingSystem.js`

Mengatur:

- Fluorescent office fixtures
- Area lights
- Flicker halus
- Light channels
- Runtime scale dari DepartmentControlSystem

Channel yang digunakan:

- `normal-office`
- `ai-cyan`
- `emergency`
- `wrongness`

Prinsip lighting:

- Realistic dulu
- Atmospheric kedua
- Tidak neon spam
- Tidak flashing agresif
- Tidak membuat pemain pusing

### AudioSystem

`frontend/src/systems/AudioSystem.js`

Audio foundation minimal:

- Low office hum
- Fluorescent/electrical undertone
- Ventilation noise

Audio hanya dimulai setelah user menekan Start, mengikuti browser autoplay rules. Tidak ada loud stinger atau cheap jumpscare sound.

## Developer Tools

`frontend/src/systems/DeveloperExploreSystem.js`

Dipakai untuk balancing dan inspeksi:

- Fly camera
- Noclip/collision toggle
- Collision grid visualization
- Prop volume visualization
- Room identity labels
- Route graph
- AI manipulation anchors
- Trigger rings
- Checkpoint markers
- Crusher path
- Live debug panel

Debug tools harus membantu tuning atmosfer dan navigasi, bukan menggantikan desain level.

## Build Dan Deployment

Vite config:

```text
frontend/vite.config.js
```

Build output:

```text
dist/
```

Build config sudah:

- Menggunakan `outDir: ../dist`
- Mengaktifkan `emptyOutDir`
- Memisahkan Three.js ke vendor chunk

Untuk deployment browser/static hosting seperti Google Cloud Storage atau Cloud Run static serving, gunakan isi folder:

```text
Mazemind/dist/
```

## Testing Checklist

Wajib dicek setelah perubahan besar:

- `npm run build` sukses.
- Dev server bisa dibuka.
- Start screen muncul.
- Pointer lock bekerja.
- Movement tidak terasa tersangkut di dinding.
- Camera tidak clipping ke wall.
- Floor-height tidak membuat camera pop.
- Semua task bisa diambil.
- Fake exit tidak menyelesaikan level jika task belum lengkap.
- Crusher memberi waktu reaksi.
- Semua task membuka final route.
- Final exit hanya menang setelah route valid.
- Restart tidak menggandakan entity, light, audio, listener, atau debug helpers.
- Free Explore tools bekerja.
- Debug helpers tidak muncul di mode gameplay normal.

## Root Cause Yang Sudah Diidentifikasi

Detail lengkap ada di:

```text
docs/TECHNICAL_AUDIT.md
```

Ringkasan:

- `Game` terlalu banyak memegang tanggung jawab.
- Level terlalu grid-first.
- Arsitektur kantor sebelumnya terlalu dekoratif dan belum cukup sistemik.
- Progression tersebar di beberapa entity.
- Lighting tidak punya runtime owner.
- AI manipulation belum punya handle nyata ke route/signage/light.
- Audio atmosfer belum ada.
- Prop collision dan floor-height belum cukup terhubung ke FPS traversal.

## Roadmap Berikutnya

Prioritas dekat:

1. Manual visual QA setiap ruang utama.
2. Tambahkan scripted AI manipulation beats.
3. Perkuat impossible-loop/fake-route sequence.
4. Tambahkan environmental storytelling props yang tetap minimal.
5. Tambahkan audio zones per room.
6. Tambahkan objective pacing agar durasi mendekati 20 menit.
7. Optimasi instancing prop berulang.
8. Tambahkan automated smoke tests untuk progression state.

Prioritas jangka menengah:

- Office-like procedural route variation.
- Runtime signage misinformation.
- Dynamic door/route blockers yang terlihat sebagai arsitektur kantor.
- More authored puzzle navigation.
- Final route yang lebih emotionally climactic.
- Better performance instrumentation untuk browser deployment.

## Prinsip Kontribusi

Saat menambah fitur, selalu cek:

- Apakah fitur ini memperkuat rasa sendirian, takut, penasaran, dan bingung?
- Apakah fitur ini menjaga atmosfer lebih penting daripada gimmick?
- Apakah ruang masih believable sebagai kantor?
- Apakah horror muncul dari environment, bukan jumpscare?
- Apakah FPS traversal tetap nyaman?
- Apakah perubahan ini bisa diskalakan untuk AI manipulation?

Jika jawabannya tidak, fitur tersebut kemungkinan bukan bagian dari MazeMind.
