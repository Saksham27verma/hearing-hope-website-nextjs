-- Remove recycled homepage shots and type-illustration SVGs stored as if they were model photos.
delete from public.product_images
where url like '/images/hero/%'
   or url like '/images/products/%.svg';
