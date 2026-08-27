-- Stop recycling homepage hero photos as if they were each catalog model.
delete from public.product_images
where url like '/images/hero/%';
