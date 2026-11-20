"use client";
/**
 * Frontend (web) · Task 10 · AuthShell.tsx - the frosted-glass frame used by every
 * account page (log in, sign up, verify code, add NID), following the reference designs:
 *
 *  Big screens:  [ sharp photo + big text      |  SAME photo, blurred = frosted glass, form on it ]
 *  Phones:       the blurred photo fills the screen and the form sits on top.
 *
 * Each page chooses its own photo and the text on the photo side.
 * The photos slowly "drift" (a gentle zoom in and out) so the page feels alive -
 * see .drift in globals.css.
 */
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

type Props = {
  photo: StaticImageData; // the background photo for this page
  photoAlt: string;
  sideTitle: ReactNode; // big text on the sharp photo (big screens)
  sideText?: string; // small text under it
  title: string; // the form's heading, e.g. "Welcome back"
  subtitle?: ReactNode;
  children: ReactNode; // the form
};

export function AuthShell({ photo, photoAlt, sideTitle, sideText, title, subtitle, children }: Props) {
  return (
    <section className="relative -mt-16 min-h-[100svh] overflow-hidden bg-black">
      {/* Phones: the whole screen is the blurred photo */}
      <Image src={photo} alt="" fill preload placeholder="blur" sizes="100vw" className="drift object-cover blur-2xl lg:hidden" />

      <div className="relative grid min-h-[100svh] lg:grid-cols-2">
        {/* LEFT (big screens): the sharp photo with the big text */}
        <div className="relative hidden lg:block">
          <Image src={photo} alt={photoAlt} fill placeholder="blur" sizes="50vw" className="drift object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="rise absolute inset-x-0 bottom-0 p-14 text-white">
            <h2 className="max-w-md text-5xl leading-tight font-semibold">{sideTitle}</h2>
            {sideText && <p className="mt-4 max-w-md text-base text-white/80">{sideText}</p>}
          </div>
        </div>

        {/* RIGHT: the SAME photo, blurred = the frosted-glass half, with the form on it */}
        <div className="relative flex items-center justify-center overflow-hidden px-6 pt-24 pb-32 lg:border-l lg:border-white/20 lg:px-16 lg:pb-12">
          <Image src={photo} alt="" fill placeholder="blur" sizes="50vw" className="drift-reverse hidden object-cover blur-3xl lg:block" />
          <div className="absolute inset-0 bg-white/5 lg:bg-black/25" />
          <div className="rise relative w-full max-w-sm text-white">
            <h1 className="text-center text-4xl font-semibold lg:text-left">{title}</h1>
            {subtitle && <div className="mt-3 text-center text-sm text-white/75 lg:text-left">{subtitle}</div>}
            <div className="mt-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
