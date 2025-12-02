<<<<<<< HEAD
# Little-Astronauts-Game-with-Google-AI-Stadio
=======
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1MZ9vqRJmO0BY3SRh8SedSk1rAT6XmjAK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   # Little Astronauts — Güneş Sistemi Oyunu

   Bu proje, Google AI Studio üzerinde barındırılan küçük bir etkileşimli oyun uygulamasıdır. Aşağıda projeyi yerel olarak çalıştırmak, geliştirmek ve dağıtım hakkında kısa ve anlaşılır adımlar yer almaktadır.

   Oyun (AI Studio) linki:
   https://ai.studio/apps/drive/1MZ9vqRJmO0BY3SRh8SedSk1rAT6XmjAK

   Önemli: Bu bağlantı korunmuştur — doğrudan tarayıcıda oyunu görüntülemek için kullanabilirsiniz.

   ## Hızlı Başlangıç (Yerelde)

   Gereksinimler:
   - Node.js (LTS sürümü önerilir)
   - npm veya yarn

   Adımlar:
   1. Bağımlılıkları yükleyin:
      `npm install`
   2. Ortam değişkenlerini ayarlayın:  
      Projede Gemini API anahtarı kullanılıyorsa kök dizine `.env.local` dosyası oluşturun ve içine şu satırı ekleyin:
      `GEMINI_API_KEY=your_gemini_api_key_here`
   3. Geliştirme sunucusunu çalıştırın:
      `npm run dev`
   4. Tarayıcınızda `http://localhost:5173` (veya Vite'in verdiği adres) açarak uygulamayı görüntüleyin.

   ## Yapı ve Dağıtım

   - Uygulamayı üretime hazırlamak için:
     `npm run build`
   - Üretim sunucusunda çalıştırmak veya statik çıktı dağıtmak için `dist/` klasörünü kullanın.
   - Proje zaten AI Studio üzerinde barındırılıyorsa, yukarıdaki "Oyun linki" doğrudan çalışır.

   ## Geliştirme Notları
   - API anahtarlarınızı kimseyle paylaşmayın; `.env.local` dosyasını `.gitignore` içinde tutmak iyi bir uygulamadır.
   - Kod yapısı: önemli bileşenler `components/` içinde, servisler `services/` içinde toplanmıştır.
   - Değişiklik yaptıktan sonra yerelde testi ve ardından isterseniz GitHub'a push yapın.

   ## Katkı
   - Hatalar ve geliştirmeler için pull request gönderin veya issue açın.

   ## Lisans
   - Proje lisansını eklemek istiyorsanız `LICENSE` dosyası oluşturun.
