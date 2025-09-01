using Domain.Enums;

namespace Domain.Entities;

public sealed class File : BaseEntity
{
    public Module Module { get; set; }
    public string FileName { get; set; }
    public string? TotalPages { get; set; }
    public string? Summary { get; set; }
    public string? Answer { get; set; }
    public int? CompletionTokens { get; set; }
    public int? PromptTokens { get; set; }
    public int? TotalTokens { get; set; }
    public int? CompletionTime { get; set; }
    public int? PromptTime { get; set; }
    public int? QueueTime { get; set; }
    public int? TotalTime { get; set; }
    public IEnumerable<Page>? Pages { get; set; }
    public IEnumerable<Agent>? Agents => _agents;
    private readonly List<Agent> _agents = [];

    public bool HasAgent(Guid idAgent)
    {
        return _agents.Any(x => x.Id == idAgent);
    }

    public void AddAgent(Agent agent)
    {
        _agents.Add(agent);
    }

    public void RemoveAgent(Agent agent)
    {
        _agents.Remove(agent);
    }
}
