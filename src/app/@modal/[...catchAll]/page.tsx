// Clears the @modal slot on soft navigation.
//
// A parallel slot keeps whatever it last rendered when the user navigates to a
// route the slot has no match for (default.tsx only applies on a hard reload).
// Without this file, going from an open artwork overlay to /profile/[id] left
// the intercepted artwork page mounted on top of the profile. Any URL the
// slot doesn't explicitly intercept (e.g. /artwork/[slug]) now resolves here
// and renders nothing, so the overlay unmounts as soon as the route changes.
export default function CatchAll() {
  return null
}
