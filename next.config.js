/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      /* 🛒 E-commerce, CDN phổ biến */
      { protocol: "https", hostname: "cdn.tgdd.vn", pathname: "/**" },
      { protocol: "https", hostname: "img.tgdd.vn", pathname: "/**" },
      { protocol: "https", hostname: "salt.tgdd.vn", pathname: "/**" },
      { protocol: "https", hostname: "cdn.tikicdn.com", pathname: "/**" },
      { protocol: "https", hostname: "cf.shopee.vn", pathname: "/**" },
      {
        protocol: "https",
        hostname: "down-vn.img.susercontent.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },

      /* ☁️ Cloud & Storage */
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "s3.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "*.s3.ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },

      /* 👤 Avatars & Social */
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "graph.facebook.com", pathname: "/**" },
      { protocol: "https", hostname: "pbs.twimg.com", pathname: "/**" },
      { protocol: "https", hostname: "abs.twimg.com", pathname: "/**" },
      { protocol: "https", hostname: "static.xx.fbcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
      { protocol: "https", hostname: "media.tenor.com", pathname: "/**" },

      /* 🌍 Các trang tin / blog Việt Nam */
      { protocol: "https", hostname: "blog.btaskee.com", pathname: "/**" },
      { protocol: "https", hostname: "monngonmoingay.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.cet.edu.vn", pathname: "/**" },
      { protocol: "https", hostname: "static.cooky.vn", pathname: "/**" },
      { protocol: "https", hostname: "www.cet.edu.vn", pathname: "/**" },
      { protocol: "https", hostname: "www.cooky.vn", pathname: "/**" },
      { protocol: "https", hostname: "bepxua.vn", pathname: "/**" },
      { protocol: "https", hostname: "afamilycdn.com", pathname: "/**" },
      { protocol: "https", hostname: "kenh14cdn.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "vcdn1-dulich.vnecdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vcdn1-giaitri.vnecdn.net",
        pathname: "/**",
      },

      /* 🔍 Search engines */
      { protocol: "https", hostname: "bing.com", pathname: "/th/**" },
      { protocol: "https", hostname: "www.bing.com", pathname: "/th/**" },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "/images/**",
      },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "pixabay.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.pixabay.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      { protocol: "https", hostname: "img.freepik.com", pathname: "/**" },

      /* 🧑‍🍳 Ẩm thực nước ngoài */
      {
        protocol: "https",
        hostname: "www.themealdb.com",
        pathname: "/images/**",
      },
      { protocol: "https", hostname: "www.allrecipes.com", pathname: "/**" },
      { protocol: "https", hostname: "food.fnr.sndimg.com", pathname: "/**" },

      { protocol: "https", hostname: "th.bing.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
   experimental: {
    serverActions: {
      bodySizeLimit: "25mb", // hoặc "50mb" tuỳ video
    },
  },
};

module.exports = nextConfig;

