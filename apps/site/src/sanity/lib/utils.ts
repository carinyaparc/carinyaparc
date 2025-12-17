import createImageUrlBuilder from '@sanity/image-url';
import { dataset, projectId, studioUrl } from '@/sanity/lib/api';
import { createDataAttribute, CreateDataAttributeProps } from 'next-sanity';

// Type for Sanity image source (compatible with @sanity/image-url)
type SanityImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>['image']>[0];

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
});

// Type for Sanity image with crop data
interface SanityImageWithCrop {
  asset?: { _ref: string };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
}

// Helper to extract dimensions from Sanity image reference
function getImageDimensions(ref: string): { width: number; height: number } {
  const parts = ref.split('-');
  if (parts.length < 3 || !parts[2]) {
    // Fallback dimensions if format is unexpected
    return { width: 1200, height: 800 };
  }
  const dimensions = parts[2];
  const [width, height] = dimensions.split('x').map(Number);
  return { width: width || 1200, height: height || 800 };
}

export const urlForImage = (source: SanityImageSource) => {
  // Ensure that source image contains a valid reference
  if (!source || typeof source !== 'object' || !('asset' in source)) {
    return undefined;
  }

  const imageWithCrop = source as SanityImageWithCrop;
  if (!imageWithCrop?.asset?._ref) {
    return undefined;
  }

  const imageRef = imageWithCrop.asset._ref;
  const crop = imageWithCrop.crop;

  // get the image's og dimensions
  const { width, height } = getImageDimensions(imageRef);

  if (crop) {
    // compute the cropped image's area
    const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)));

    const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)));

    // compute the cropped image's position
    const left = Math.floor(width * crop.left);
    const top = Math.floor(height * crop.top);

    // gather into a url
    return imageBuilder?.image(source).rect(left, top, croppedWidth, croppedHeight).auto('format');
  }

  return imageBuilder?.image(source).auto('format');
};

export function resolveOpenGraphImage(image: SanityImageSource, width = 1200, height = 627) {
  if (!image) return;
  const url = urlForImage(image)?.width(1200).height(627).fit('crop').url();
  if (!url) return;
  const imageWithAlt = image as SanityImageWithCrop;
  return { url, alt: imageWithAlt?.alt as string, width, height };
}

// Type for Sanity link reference
interface Link {
  linkType?: 'href' | 'page' | 'post';
  href?: string;
  page?: string;
  post?: string;
}

// Depending on the type of link, we need to fetch the corresponding page, post, or URL.  Otherwise return null.
export function linkResolver(link: Link | undefined) {
  if (!link) return null;

  // If linkType is not set but href is, lets set linkType to "href".  This comes into play when pasting links into the portable text editor because a link type is not assumed.
  if (!link.linkType && link.href) {
    link.linkType = 'href';
  }

  switch (link.linkType) {
    case 'href':
      return link.href || null;
    case 'page':
      if (link?.page && typeof link.page === 'string') {
        return `/${link.page}`;
      }
      break;
    case 'post':
      if (link?.post && typeof link.post === 'string') {
        return `/posts/${link.post}`;
      }
      break;
    default:
      return null;
  }
}

type DataAttributeConfig = CreateDataAttributeProps &
  Required<Pick<CreateDataAttributeProps, 'id' | 'type' | 'path'>>;

export function dataAttr(config: DataAttributeConfig) {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).combine(config);
}
