// Early Hints Edge Function for Netlify
// This helps with preloading critical resources

export default async function handler(request, context) {
  try {
    // List of critical resources to preload
    const criticalResources = [
      { path: "/_next/static/css/1773a1dda5c4e148.css", as: "style" },
      { path: "/_next/static/chunks/main.js", as: "script" },
      { path: "/_next/static/chunks/pages/_app.js", as: "script" },
      { path: "/_next/static/chunks/webpack.js", as: "script" },
      { path: "/_next/static/chunks/framework.js", as: "script" },
    ];

    // Generate Link headers for preloading
    const linkHeaders = criticalResources.map(
      (resource) => `<${resource.path}>; rel=preload; as=${resource.as}`
    );
    
    // Add preconnect hints for external resources
    linkHeaders.push('<https://images.unsplash.com>; rel=preconnect');
    linkHeaders.push('<https://fonts.googleapis.com>; rel=preconnect');
    linkHeaders.push('<https://fonts.gstatic.com>; rel=preconnect; crossorigin');

    // Create a new request for the origin
    const newRequest = new Request(request);
    
    // Add the Link header to response headers
    const response = await fetch(newRequest);
    
    // Create a new response with the Link header
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Link', linkHeaders.join(', '));
    
    return modifiedResponse;
  } catch (error) {
    console.error('Edge function error:', error);
    // If there's an error, just pass through the original request
    return fetch(request);
  }
}