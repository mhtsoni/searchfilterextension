// Filter search results
function filterResults() {
  chrome.runtime.sendMessage({ type: 'GET_BLOCKED_DOMAINS' }, (response) => {
    const { bannedDomains, userBlockedDomains, overrideDomains } = response;

    // Select all search result containers
    const searchResults = document.querySelectorAll('.g, .tF2Cxc'); // Handles different layouts

    searchResults.forEach((result) => {
      const link = result.querySelector('a[href]') as HTMLAnchorElement; // Explicitly cast as HTMLAnchorElement
      if (!link) return;

      try {
        const url = new URL(link.href);
        const domain = url.hostname.replace('www.', ''); // Normalize domain by removing 'www.'

        // Check if the domain is blocked
        if (
          (bannedDomains.includes(domain) || userBlockedDomains.includes(domain)) &&
          !overrideDomains.includes(domain)
        ) {
          result.remove();
        }
      } catch (error) {
        console.error('Error processing link:', error);
      }
    });
  });
}

// Initial filter
filterResults();

// Filter on dynamic content updates
const observer = new MutationObserver(filterResults);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
