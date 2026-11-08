using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Tests;

public class AttendanceScheduleTests
{
    private static readonly DateOnly Monday = new(2026, 11, 9);
    private static readonly TimeSpan ArgentinaOffset = TimeSpan.FromHours(-3);
    private static Activity Activity => new()
    {
        Days = ActivityDays.Monday | ActivityDays.Wednesday,
        StartTime = new TimeOnly(15, 0),
        EndTime = new TimeOnly(17, 0)
    };

    [Theory]
    [InlineData(14, 59, false)]
    [InlineData(15, 0, true)]
    [InlineData(16, 59, true)]
    [InlineData(17, 0, false)]
    public void RegistrationRespectsClassTime(int hour, int minute, bool allowed)
    {
        var now = new DateTimeOffset(2026, 11, 9, hour, minute, 0, ArgentinaOffset);
        Assert.Equal(allowed, AttendanceSchedule.CanRegister(Activity, Monday, now));
    }

    [Fact]
    public void RegistrationRequiresScheduledDayAndToday()
    {
        var tuesday = new DateTimeOffset(2026, 11, 10, 16, 0, 0, ArgentinaOffset);
        Assert.False(AttendanceSchedule.CanRegister(Activity, new DateOnly(2026, 11, 10), tuesday));
        Assert.False(AttendanceSchedule.CanRegister(Activity, Monday, tuesday));
    }

    [Fact]
    public void RegistrationAcceptsSundayWhenScheduled()
    {
        var sunday = new DateTimeOffset(2026, 11, 8, 15, 0, 0, ArgentinaOffset);
        var activity = Activity;
        activity.Days = ActivityDays.Sunday;
        Assert.True(AttendanceSchedule.CanRegister(activity, new DateOnly(2026, 11, 8), sunday));
    }

    [Fact]
    public void EditingRequiresTodayAndClassTime()
    {
        var now = new DateTimeOffset(2026, 11, 9, 16, 0, 0, ArgentinaOffset);
        Assert.True(AttendanceSchedule.CanEdit(Activity, Monday, now));
        Assert.False(AttendanceSchedule.CanEdit(Activity, Monday.AddDays(-1), now));
        Assert.False(AttendanceSchedule.CanEdit(null, Monday, now));
    }

    [Fact]
    public void FutureDatesUseArgentinaCalendarRatherThanUtcDate()
    {
        // En Argentina todavía es domingo aunque UTC ya sea lunes.
        var localNow = new DateTimeOffset(2026, 11, 8, 23, 30, 0, ArgentinaOffset);
        Assert.True(AttendanceSchedule.IsValidDate(new DateOnly(2026, 11, 8), localNow));
        Assert.False(AttendanceSchedule.IsValidDate(Monday, localNow));
        Assert.False(AttendanceSchedule.IsValidDate(default, localNow));
    }

    [Fact]
    public void ArgentinaTimeZoneConvertsUtcAcrossMidnight()
    {
        var utc = new DateTimeOffset(2026, 11, 9, 2, 30, 0, TimeSpan.Zero);
        var local = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(utc, "America/Argentina/Buenos_Aires");
        Assert.Equal(new DateOnly(2026, 11, 8), DateOnly.FromDateTime(local.DateTime));
        Assert.Equal(ArgentinaOffset, local.Offset);
    }
}
