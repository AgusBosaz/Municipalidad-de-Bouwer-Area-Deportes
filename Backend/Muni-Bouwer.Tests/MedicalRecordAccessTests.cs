using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Api.Controllers;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Tests;

public class MedicalRecordAccessTests
{
    [Fact]
    public async Task InstructorCannotModifyMedicalInformationEvenWithManagePermission()
    {
        var controller = new MedicalRecordsController(null!, null!)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(
                        [new Claim(ClaimTypes.Role, RoleNames.Instructor),
                         new Claim("permission", PermissionNames.MedicalRecordsManage)], "test"))
                }
            }
        };

        var result = await controller.Upsert(1, new UpsertMedicalRecordDto());
        Assert.IsType<ForbidResult>(result);
    }
}
