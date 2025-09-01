using Mapster;
using Domain.Entities;
using Application.DTOs.DataConfig;
using Application.DTOs.Knowledge;
using Application.DTOs.SeniorErpConfig;
using Application.DTOs.SeniorHcmConfig;

namespace GemelliApi.Application.Mappings;

public static class MapConfig
{
    public static void Register(TypeAdapterConfig config)
    {
        // DataConfig
        config.NewConfig<DataConfig, DataConfigResponse>();
        
        // SeniorErpConfig
        config.NewConfig<SeniorErpConfig, SeniorErpConfigResponse>()
            .Map(dest => dest.IdSeniorErpConfig, src => src.Id);
        
        // SeniorHCMConfig
        config.NewConfig<SeniorHcmConfig, SeniorHcmConfigResponse>()
            .Map(dest => dest.IdSeniorHcmConfig, src => src.Id);
        
        // Knowledge
        config.NewConfig<Knowledge, KnowledgeResponse>()
            .Map(dest => dest.IdKnowledge, src => src.Id);
    }
}
