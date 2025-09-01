using System.Net.Http.Headers;

namespace Infrastructure.HttpClient.Handlers;

public class AuthHeaderHandler : DelegatingHandler
{

    public AuthHeaderHandler()
    {
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
    }
}