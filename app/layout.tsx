import type { Metadata } from "next";
import Script from "next/script";
import { 
  Geist, 
  Geist_Mono, 
  Outfit, 
  Inter, 
  Noto_Sans,
  Figtree,
  Roboto,
  Raleway,
  DM_Sans,
  Public_Sans,
  JetBrains_Mono
} from "next/font/google";
import "./globals.css";
import { DirectionProvider } from "@/context/direction-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { FontProvider } from "@/context/font-provider";
import { LayoutProvider } from "@/context/layout-provider";
import { SearchProvider } from "@/context/search-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { NextAuthSessionProvider } from "@/lib/providers/session-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({subsets:['latin'],variable:'--font-outfit'});
const inter = Inter({subsets:['latin'],variable:'--font-inter'});
const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-noto-sans', weight: ['400', '500', '600', '700']});
const figtree = Figtree({subsets:['latin'],variable:'--font-figtree', weight: ['400', '500', '600', '700']});
const roboto = Roboto({subsets:['latin'],variable:'--font-roboto', weight: ['400', '500', '700']});
const raleway = Raleway({subsets:['latin'],variable:'--font-raleway', weight: ['400', '500', '600', '700']});
const dmSans = DM_Sans({subsets:['latin'],variable:'--font-dm-sans', weight: ['400', '500', '600', '700']});
const publicSans = Public_Sans({subsets:['latin'],variable:'--font-public-sans', weight: ['400', '500', '600', '700']});
const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-jetbrains-mono', weight: ['400', '500', '600', '700']});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quick Mart Admin",
  description: "Admin dashboard built with Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${notoSans.variable} ${figtree.variable} ${roboto.variable} ${raleway.variable} ${dmSans.variable} ${publicSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Apply dark/light theme
                  var themeCookie = document.cookie.split('; ').find(function(row) { return row.startsWith('ui-theme='); });
                  var theme = themeCookie ? themeCookie.split('=')[1] : 'system';
                  var resolvedTheme = theme;
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(resolvedTheme);
                  
                  // Apply color theme (neutral = default/black)
                  var colorThemeCookie = document.cookie.split('; ').find(function(row) { return row.startsWith('active-theme='); });
                  var colorTheme = colorThemeCookie ? colorThemeCookie.split('=')[1] : 'neutral';
                  document.body.classList.add('theme-' + colorTheme);
                  
                  // Apply font
                  var fontCookie = document.cookie.split('; ').find(function(row) { return row.startsWith('font='); });
                  var font = fontCookie ? fontCookie.split('=')[1] : 'outfit';
                  var validFonts = ['outfit', 'inter', 'noto-sans', 'figtree', 'roboto', 'raleway', 'dm-sans', 'public-sans', 'jetbrains-mono'];
                  if (validFonts.includes(font)) {
                    document.documentElement.classList.add('font-' + font);
                  } else {
                    document.documentElement.classList.add('font-outfit');
                  }
                } catch (e) {}
              })();
            `,
          }}
        /> */}
        <NextAuthSessionProvider>
          <QueryProvider>
            <ThemeProvider>
              <ActiveThemeProvider>
                <FontProvider>
                  <DirectionProvider>
                    <LayoutProvider>
                      <SearchProvider>
                        {children}
                      </SearchProvider>
                    </LayoutProvider>
                  </DirectionProvider>
                </FontProvider>
              </ActiveThemeProvider>
            </ThemeProvider>
          </QueryProvider>
        </NextAuthSessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
