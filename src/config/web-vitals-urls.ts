import { site } from "@/lib/site";

const paths = ["/", "/clinics", "/services/bera-test", "/services/pure-tone-audiometry", "/services/tympanometry", "/services/oae-test", "/services/speech-therapy", "/hearing-aids", "/hearing-aids/brands/signia", "/hearing-aids/brands/phonak", "/hearing-aids/brands/widex", "/hearing-aids/brands/oticon", "/blog", "/pricing", "/about", "/contact", "/services", "/hearing-aids/types/bte", "/hearing-aids/types/ric", "/hearing-aids/features/rechargeable"];
export const WEB_VITAL_URLS = paths.map((path) => `${site.url}${path}`);
